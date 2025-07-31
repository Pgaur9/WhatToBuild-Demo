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
import { Edit, Eye, Copy, Check, Download, Maximize2 } from 'lucide-react';

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
      // Skip graph declarations and subgraph declarations
      if (line.match(/^(graph|flowchart|subgraph|end|style)/i)) {
        continue;
      }

      // Parse connections: A --> B, A -- label --> B, etc.
      const connectionMatch = line.match(/^(.+?)\s*(-->|---|--)\s*(.+?)(?:\s*:\s*(.+))?$/);
      if (connectionMatch) {
        let [, source, arrow, target, label] = connectionMatch;
        
        // Extract node names and labels from [NodeName] format
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

        // Add nodes
        if (!nodeSet.has(sourceNode.id)) {
          parsedNodes.push(sourceNode);
          nodeSet.add(sourceNode.id);
        }
        if (!nodeSet.has(targetNode.id)) {
          parsedNodes.push(targetNode);
          nodeSet.add(targetNode.id);
        }

        // Add edge
        parsedEdges.push({
          source: sourceNode.id,
          target: targetNode.id,
          label: label || undefined
        });
      }

      // Parse standalone nodes
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
    // Create nodes with automatic positioning
    const flowNodes: Node[] = parsedNodes.map((node, index) => {
      const cols = Math.ceil(Math.sqrt(parsedNodes.length));
      const x = (index % cols) * 200 + 100;
      const y = Math.floor(index / cols) * 100 + 50;

      return {
        id: node.id,
        type: 'default',
        position: { x, y },
        data: { 
          label: node.label,
        },
        style: {
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#f8fafc',
          border: '2px solid #334155',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: '600',
          padding: '16px 20px',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          minWidth: '140px',
          minHeight: '60px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
        },
      };
    });

    // Create edges
    const flowEdges: Edge[] = parsedEdges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      style: { 
        stroke: '#8b5cf6',
        strokeWidth: 3,
        strokeDasharray: edge.label ? undefined : '8,4',
        filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.3))'
      },
      labelStyle: { 
        fill: '#f1f5f9', 
        fontSize: '12px',
        fontWeight: '600',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
      },
      labelBgStyle: {
        fill: '#1e293b',
        fillOpacity: 0.95,
        rx: 8,
        ry: 8,
        stroke: '#475569',
        strokeWidth: 1
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#8b5cf6',
        width: 24,
        height: 24
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
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: downloadRef.current.offsetWidth,
        height: downloadRef.current.offsetHeight,
      });
      
      const dataURL = canvas.toDataURL('image/png');
      
      // Create download link
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

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/25"></div>
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/25"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/25"></div>
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {title || 'Architecture Diagram'}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          {prompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyPromptToClipboard}
              className="bg-slate-800/60 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              {promptCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="ml-2 font-medium">Prompt</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="bg-slate-800/60 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="ml-2 font-medium">Code</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            disabled={downloading}
            className="bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="ml-2 font-medium">Image</span>
          </Button>
          {editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isEditing ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
              <span className="ml-2 font-medium">{isEditing ? 'Preview' : 'Edit'}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <div className="relative group">
              <textarea
                value={editableChart}
                onChange={(e) => setEditableChart(e.target.value)}
                className="w-full h-96 p-6 bg-slate-900/80 border border-slate-600/50 rounded-2xl text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm shadow-inner group-hover:shadow-lg"
                placeholder="Enter Mermaid diagram syntax...

Example:
graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server 1]
    B --> D[Server 2]
    C --> E[Database]
    D --> E"
              />
              <div className="absolute top-4 right-4 text-xs text-slate-500 bg-slate-800/90 px-3 py-1.5 rounded-full backdrop-blur-sm border border-slate-700/50">
                Mermaid Syntax
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-8 py-2.5 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 rounded-xl"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="bg-slate-800/60 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-sm font-medium px-8 py-2.5 shadow-lg hover:shadow-xl hover:scale-105 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            ref={downloadRef}
            className="w-full h-[700px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              className="bg-transparent"
              fitViewOptions={{
                padding: 0.15,
                includeHiddenNodes: false,
                maxZoom: 1.2,
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
                className="bg-slate-800/90 border-slate-600/50 backdrop-blur-xl shadow-xl [&>button]:bg-slate-700/80 [&>button]:border-slate-600/50 [&>button]:text-slate-300 [&>button:hover]:bg-slate-600/80 [&>button]:transition-all [&>button]:duration-300 [&>button:hover]:scale-110 rounded-xl m-4"
                showZoom={true}
                showFitView={true}
                showInteractive={true}
              />
              <MiniMap 
                className="bg-slate-800/90 border-slate-600/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-xl m-4"
                maskColor="rgba(15, 23, 42, 0.7)"
                nodeColor="#475569"
                nodeStrokeColor="#94a3b8"
                nodeBorderRadius={12}
                nodeStrokeWidth={2}
                pannable={true}
                zoomable={true}
              />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={32} 
                size={2} 
                color="#334155" 
                className="opacity-40"
              />
              <Panel position="top-right" className="m-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {}}
                  className="bg-slate-800/90 border-slate-600/50 text-slate-300 hover:bg-slate-700/90 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 rounded-xl"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </Panel>
            </ReactFlow>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function FlowDiagram(props: FlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
}