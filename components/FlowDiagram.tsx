/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, Copy, Check, Download, Maximize2, Code, FileText, Minimize2, X } from 'lucide-react';

interface FlowDiagramProps {
  chart: string;
  title?: string;
  editable?: boolean;
  onUpdate?: (newChart: string) => void;
  prompt?: string | null;
}

interface ParsedNode {
  id: string;
  label: string;
}

interface ParsedEdge {
  source: string;
  target: string;
  label?: string;
}

const FlowDiagramInner = ({
  chart,
  title,
  editable = false,
  onUpdate,
  prompt
}: FlowDiagramProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editableChart, setEditableChart] = useState(chart);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getNodes, getEdges, getViewport } = useReactFlow();
  const downloadRef = useRef<HTMLDivElement>(null);

  const parseMermaidToFlow = (mermaidText: string) => {
    const lines = mermaidText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const parsedNodes: ParsedNode[] = [];
    const parsedEdges: ParsedEdge[] = [];
    const nodeSet = new Set<string>();

    for (const line of lines) {
      if (line.match(/^(graph|flowchart|subgraph|end|style)/i)) {
        continue;
      }

      const connectionMatch = line.match(/^(.+?)\s*(-->|---|--)\s*(.+?)(?:\s*:\s*(.+))?$/);
      if (connectionMatch) {
        const [, source, arrow, target, label] = connectionMatch;
        
        const extractNode = (nodeStr: string) => {
          const match = nodeStr.match(/^(\w+)(?:\[([^\]]+)\])?/);
          if (match) {
            const [, id, nodeLabel] = match;
            return { id, label: nodeLabel || id };
          }
          return { id: nodeStr.trim(), label: nodeStr.trim() };
        };

        const sourceNode = extractNode(source);
        const targetNode = extractNode(target);

        if (!nodeSet.has(sourceNode.id)) {
          parsedNodes.push(sourceNode);
          nodeSet.add(sourceNode.id);
        }
        if (!nodeSet.has(targetNode.id)) {
          parsedNodes.push(targetNode);
          nodeSet.add(targetNode.id);
        }

        parsedEdges.push({
          source: sourceNode.id,
          target: targetNode.id,
          label: label || undefined
        });
      }

      const standaloneMatch = line.match(/^(\w+)(?:\[([^\]]+)\])?$/);
      if (standaloneMatch && !line.includes('-->') && !line.includes('--')) {
        const [, id, nodeLabel] = standaloneMatch;
        if (!nodeSet.has(id)) {
          parsedNodes.push({ id, label: nodeLabel || id });
          nodeSet.add(id);
        }
      }
    }

    return { nodes: parsedNodes, edges: parsedEdges };
  };

  const createFlowElements = (parsedNodes: ParsedNode[], parsedEdges: ParsedEdge[]) => {
    const flowNodes: Node[] = parsedNodes.map((node, index) => {
      const cols = Math.min(Math.ceil(Math.sqrt(parsedNodes.length)), 5);
      const x = (index % cols) * 220 + 50;
      const y = Math.floor(index / cols) * 120 + 50;

      return {
        id: node.id,
        type: 'default',
        position: { x, y },
        data: { 
          label: node.label,
        },
        style: {
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px) saturate(200%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          padding: '12px 16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          minWidth: '120px',
          minHeight: '40px',
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      };
    });

    const flowEdges: Edge[] = parsedEdges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      style: { 
        stroke: 'rgba(255, 255, 255, 0.4)',
        strokeWidth: 2,
        strokeDasharray: edge.label ? undefined : '6,4',
        filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))',
      },
      labelStyle: { 
        fill: '#e8eaed', 
        fontSize: '11px',
        fontWeight: '500',
      },
      labelBgStyle: {
        fill: 'rgba(0, 0, 0, 0.7)',
        fillOpacity: 1,
        rx: 8,
        ry: 8,
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1,
        backdropFilter: 'blur(20px)'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'rgba(255, 255, 255, 0.5)',
        width: 18,
        height: 18
      },
      animated: !edge.label
    }));

    return { nodes: flowNodes, edges: flowEdges };
  };

  useEffect(() => {
    try {
      const { nodes: parsedNodes, edges: parsedEdges } = parseMermaidToFlow(editableChart);
      const { nodes: flowNodes, edges: flowEdges } = createFlowElements(parsedNodes, parsedEdges);
      
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Error parsing diagram:', error);
    }
  }, [editableChart, setNodes, setEdges]);

  useEffect(() => {
    setEditableChart(chart);
  }, [chart]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = () => {
    onUpdate?.(editableChart);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableChart(chart);
    setIsEditing(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableChart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadImage = useCallback(async () => {
    if (!downloadRef.current) return;
    
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(downloadRef.current, {
        backgroundColor: 'rgba(10, 10, 12, 0.98)',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: downloadRef.current.offsetWidth,
        height: downloadRef.current.offsetHeight,
      });
      
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title || 'architecture-diagram'}.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setDownloading(false);
    }
  }, [title]);

  const copyPromptToClipboard = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-gray-900/10 to-black/20" />
        
        {/* Fullscreen Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-2xl bg-black/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse delay-150"></div>
            </div>
            <h2 className="text-xl font-medium text-white/90 tracking-wide">
              {title || 'Architecture Diagram'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadImage}
              disabled={downloading}
              className="h-10 px-4 bg-black/30 border border-white/20 text-white/80 hover:bg-black/40 hover:border-white/30 transition-all duration-300 backdrop-blur-xl rounded-xl shadow-lg hover:text-white"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-10 px-4 bg-black/30 border border-white/20 text-white/80 hover:bg-black/40 hover:border-white/30 transition-all duration-300 backdrop-blur-xl rounded-xl shadow-lg hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Content */}
        <div 
          ref={downloadRef}
          className="relative flex-1 h-[calc(100vh-88px)] bg-gradient-to-br from-black/50 via-gray-900/30 to-black/50 backdrop-blur-2xl"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
              maxZoom: 2,
              minZoom: 0.1,
            }}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
          >
            <Controls 
              className="!bg-white/[0.03] !border-white/10 backdrop-blur-2xl !shadow-2xl [&>button]:!bg-white/[0.05] [&>button]:!border-white/10 [&>button]:!text-white/80 [&>button:hover]:!bg-white/[0.08] [&>button:hover]:!border-white/20 [&>button]:!transition-all [&>button]:!duration-300 !rounded-2xl !m-6 hover:!shadow-indigo-500/10"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <MiniMap 
              className="!bg-black/60 !border-white/30 backdrop-blur-2xl !rounded-xl !shadow-2xl !m-6"
              maskColor="rgba(0, 0, 0, 0.8)"
              nodeColor="rgba(255, 255, 255, 0.2)"
              nodeStrokeColor="rgba(255, 255, 255, 0.4)"
              nodeBorderRadius={12}
              nodeStrokeWidth={1}
              pannable={true}
              zoomable={true}
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={30} 
              size={1.5} 
              color="rgba(255, 255, 255, 0.1)" 
              className="opacity-30"
            />
          </ReactFlow>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Container */}
      <div className="relative overflow-hidden rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/20">
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-gray-800/5 to-black/10 pointer-events-none" />
        
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 backdrop-blur-2xl bg-black/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-150"></div>
              </div>
              <h2 className="text-lg sm:text-xl font-medium text-white/90 tracking-wide">
                {title || 'Repository Architecture'}
              </h2>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {prompt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPromptToClipboard}
                  className="h-10 px-4 bg-black/30 border border-white/20 text-white/70 hover:bg-black/40 hover:border-white/30 transition-all duration-300 backdrop-blur-xl rounded-xl text-sm font-medium shadow-lg hover:text-white/90"
                >
                  {promptCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Prompt</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-10 px-4 bg-black/30 border border-white/20 text-white/70 hover:bg-black/40 hover:border-white/30 transition-all duration-300 backdrop-blur-xl rounded-xl text-sm font-medium shadow-lg hover:text-white/90"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Code className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Code</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadImage}
                disabled={downloading}
                className="h-10 px-4 bg-black/30 border border-white/20 text-white/70 hover:bg-black/40 hover:border-white/30 transition-all duration-300 backdrop-blur-xl rounded-xl text-sm font-medium shadow-lg hover:text-white/90 disabled:opacity-50"
              >
                {downloading ? (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-indigo-400 rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Save</span>
              </Button>
              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-10 px-4 bg-black/30 border border-white/20 text-white/70 hover:bg-black/40 hover:border-white/30 transition-all duration-300 backdrop-blur-xl rounded-xl text-sm font-medium shadow-lg hover:text-white/90"
                >
                  {isEditing ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">{isEditing ? 'Preview' : 'Edit'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={editableChart}
                  onChange={(e) => setEditableChart(e.target.value)}
                  className="w-full h-64 sm:h-80 p-6 bg-black/20 border border-white/20 rounded-2xl text-white/90 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-2xl placeholder:text-white/40 shadow-inner"
                  placeholder={`Enter Mermaid diagram syntax...

Example:
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server 1]
    B --> D[Server 2]
    C --> E[Database]
    D --> E`}
                />
                <div className="absolute top-4 right-4 text-xs text-white/50 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-xl border border-white/20 font-medium">
                 
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-gradient-to-r from-gray-600/80 to-gray-700/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-medium px-8 py-3 transition-all duration-300 rounded-xl border-0 shadow-lg"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="bg-black/30 border border-white/20 text-white/70 hover:bg-black/40 hover:border-white/30 transition-all duration-300 backdrop-blur-xl font-medium px-8 py-3 rounded-xl hover:text-white/90 shadow-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div 
              ref={downloadRef}
              className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-black/10 rounded-2xl border border-white/20 overflow-hidden shadow-2xl relative backdrop-blur-2xl"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                className="bg-transparent"
                proOptions={{ hideAttribution: true }}
                fitViewOptions={{
                  padding: 0.2,
                  includeHiddenNodes: false,
                  maxZoom: 1.2,
                  minZoom: 0.4,
                }}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                panOnDrag={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={false}
              >
                <Controls 
                  className="!bg-white/10 !border-white/40 backdrop-blur-2xl !shadow-2xl [&>button]:!bg-white/20 [&>button]:!border-white/50 [&>button]:!text-white [&>button:hover]:!bg-white/30 [&>button:hover]:!border-white/60 [&>button:hover]:!text-white [&>button]:!transition-all [&>button]:!duration-300 !rounded-2xl !m-6 [&>button]:!shadow-2xl [&>button]:!w-12 [&>button]:!h-12 [&>button]:!text-lg [&>button]:!font-bold"
                  showZoom={true}
                  showFitView={true}
                  showInteractive={false}
                />
                <MiniMap 
                  className="!bg-white/5 !border-white/30 backdrop-blur-2xl !rounded-2xl !shadow-2xl !m-6 !w-48 !h-32"
                  maskColor="rgba(0, 0, 0, 0.8)"
                  nodeColor="rgba(255, 255, 255, 0.4)"
                  nodeStrokeColor="rgba(255, 255, 255, 0.6)"
                  nodeBorderRadius={8}
                  nodeStrokeWidth={2}
                  pannable={true}
                  zoomable={true}
                />
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={30} 
                  size={1.5} 
                  color="rgba(255, 255, 255, 0.1)" 
                  className="opacity-30"
                />
                <Panel position="top-right" className="m-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="h-12 w-12 p-0 bg-white/20 border-2 border-white/50 text-white hover:bg-white/30 hover:border-white/70 hover:text-white transition-all duration-300 backdrop-blur-xl rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </Panel>
              </ReactFlow>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function FlowDiagram(props: FlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
}