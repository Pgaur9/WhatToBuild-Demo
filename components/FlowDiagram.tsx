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
        let [, source, arrow, target, label] = connectionMatch;
        
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
      const cols = Math.ceil(Math.sqrt(parsedNodes.length));
      const x = (index % cols) * 240 + 140;
      const y = Math.floor(index / cols) * 140 + 100;

      return {
        id: node.id,
        type: 'default',
        position: { x, y },
        data: { 
          label: node.label,
        },
        style: {
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          color: '#e2e8f0',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: '16px',
          fontSize: '13px',
          fontWeight: '500',
          padding: '14px 20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          minWidth: '140px',
          minHeight: '50px',
          textAlign: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        stroke: 'rgba(59, 130, 246, 0.6)',
        strokeWidth: 2,
        strokeDasharray: edge.label ? undefined : '5,3',
      },
      labelStyle: { 
        fill: '#cbd5e1', 
        fontSize: '11px',
        fontWeight: '500',
      },
      labelBgStyle: {
        fill: 'rgba(15, 23, 42, 0.8)',
        fillOpacity: 1,
        rx: 8,
        ry: 8,
        stroke: 'rgba(71, 85, 105, 0.4)',
        strokeWidth: 1
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'rgba(59, 130, 246, 0.6)',
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
        backgroundColor: 'rgba(3, 7, 18, 0.95)',
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
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-slate-900/20" />
        
        {/* Fullscreen Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-slate-700/20 backdrop-blur-xl bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500/80 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-cyan-500/80 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-slate-400/80 rounded-full animate-pulse delay-150"></div>
            </div>
            <h2 className="text-lg font-semibold text-slate-200">
              {title || 'Architecture Diagram'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadImage}
              disabled={downloading}
              className="h-8 px-3 bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl rounded-lg"
            >
              {downloading ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 px-3 bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Content */}
        <div 
          ref={downloadRef}
          className="relative flex-1 h-[calc(100vh-80px)] bg-gradient-to-br from-slate-950/60 via-slate-900/40 to-slate-950/60 backdrop-blur-xl"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="bg-transparent"
            fitViewOptions={{
              padding: 0.1,
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
              className="!bg-slate-900/40 !border-slate-700/30 backdrop-blur-xl !shadow-2xl [&>button]:!bg-slate-800/40 [&>button]:!border-slate-700/30 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700/50 [&>button]:!transition-all [&>button]:!duration-200 !rounded-xl !m-6"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <MiniMap 
              className="!bg-slate-900/40 !border-slate-700/30 backdrop-blur-xl !rounded-xl !shadow-2xl !m-6"
              maskColor="rgba(15, 23, 42, 0.6)"
              nodeColor="rgba(51, 65, 85, 0.8)"
              nodeStrokeColor="rgba(100, 116, 139, 0.6)"
              nodeBorderRadius={12}
              nodeStrokeWidth={1}
              pannable={true}
              zoomable={true}
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="rgba(51, 65, 85, 0.3)" 
              className="opacity-50"
            />
          </ReactFlow>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Container */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 shadow-2xl">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 via-transparent to-slate-900/10 pointer-events-none" />
        
        {/* Header */}
        <div className="relative p-4 sm:p-5 border-b border-slate-700/20 backdrop-blur-xl bg-slate-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500/80 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-cyan-500/80 rounded-full animate-pulse delay-75"></div>
                <div className="w-1 h-1 bg-slate-400/80 rounded-full animate-pulse delay-150"></div>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-200">
                {title || 'Repository Architecture'}
              </h2>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {prompt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPromptToClipboard}
                  className="h-8 px-3 bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl rounded-lg text-xs"
                >
                  {promptCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1.5 hidden sm:inline">Prompt</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 px-3 bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl rounded-lg text-xs"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Code className="w-3.5 h-3.5" />
                )}
                <span className="ml-1.5 hidden sm:inline">Code</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadImage}
                disabled={downloading}
                className="h-8 px-3 bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl rounded-lg text-xs"
              >
                {downloading ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="ml-1.5 hidden sm:inline">Save</span>
              </Button>
              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 px-3 bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl rounded-lg text-xs"
                >
                  {isEditing ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <Edit className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1.5 hidden sm:inline">{isEditing ? 'Preview' : 'Edit'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-5">
          {isEditing ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={editableChart}
                  onChange={(e) => setEditableChart(e.target.value)}
                  className="w-full h-64 sm:h-80 p-4 bg-slate-900/40 border border-slate-700/30 rounded-xl text-slate-200 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-xl placeholder:text-slate-500"
                  placeholder={`Enter Mermaid diagram syntax...

Example:
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server 1]
    B --> D[Server 2]
    C --> E[Database]
    D --> E`}
                />
                <div className="absolute top-3 right-3 text-xs text-slate-400 bg-slate-800/60 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-700/30">
                  Mermaid
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-blue-600/80 hover:bg-blue-600/90 text-white font-medium px-6 py-2 transition-all duration-200 rounded-lg border-0"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="bg-slate-800/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl font-medium px-6 py-2 rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div 
              ref={downloadRef}
              className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-slate-950/40 rounded-xl border border-slate-700/20 overflow-hidden shadow-2xl relative backdrop-blur-xl"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                className="bg-transparent"
                fitViewOptions={{
                  padding: 0.1,
                  includeHiddenNodes: false,
                  maxZoom: 1.5,
                  minZoom: 0.3,
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
                  className="!bg-slate-900/40 !border-slate-700/30 backdrop-blur-xl !shadow-xl [&>button]:!bg-slate-800/40 [&>button]:!border-slate-700/30 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700/50 [&>button]:!transition-all [&>button]:!duration-200 !rounded-xl !m-4"
                  showZoom={true}
                  showFitView={true}
                  showInteractive={false}
                />
                <MiniMap 
                  className="!bg-slate-900/40 !border-slate-700/30 backdrop-blur-xl !rounded-xl !shadow-xl !m-4"
                  maskColor="rgba(15, 23, 42, 0.6)"
                  nodeColor="rgba(51, 65, 85, 0.8)"
                  nodeStrokeColor="rgba(100, 116, 139, 0.6)"
                  nodeBorderRadius={12}
                  nodeStrokeWidth={1}
                  pannable={true}
                  zoomable={true}
                />
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={20} 
                  size={1} 
                  color="rgba(51, 65, 85, 0.3)" 
                  className="opacity-50"
                />
                <Panel position="top-right" className="m-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="h-8 w-8 p-0 bg-slate-900/40 border border-slate-700/30 text-slate-300 hover:bg-slate-700/50 transition-all duration-200 backdrop-blur-xl rounded-lg"
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