'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, Copy, Check } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
  editable?: boolean;
  onUpdate?: (newChart: string) => void;
  prompt?: string | null;
}

export default function MermaidDiagram({ 
  chart, 
  title, 
  editable = false, 
  onUpdate,
  prompt
}: MermaidDiagramProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableChart, setEditableChart] = useState(chart);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const cleanMermaidSyntax = (diagram: string): string => {
    console.log('Original diagram:', diagram);
    
    // Remove HTML tags like <br/>, <div>, etc.
    let cleaned = diagram.replace(/<[^>]*>/g, '');
    
    // Fix nested parentheses in node labels - this is the critical fix
    // Replace "Mobile Application(Android/iOS Demos)" with "Mobile Application"
    cleaned = cleaned.replace(/\[([^\]]*?)\([^)]*\)([^\]]*)\]/g, (match, before, inner, after) => {
      console.log('Fixing nested parentheses:', match);
      // Remove the inner parentheses completely
      return `[${before}${after}]`;
    });
    
    // Also handle cases where we have multiple nested parentheses
    cleaned = cleaned.replace(/\[([^\]]*?)\([^)]*\)\]/g, '[$1]');
    
    // Replace smart quotes and dashes with standard ones
    cleaned = cleaned.replace(/[\u2013\u2014\u2015]/g, '-');
    cleaned = cleaned.replace(/[\u201C\u201D]/g, '"');
    cleaned = cleaned.replace(/[\u2018\u2019]/g, "'");
    
    // Remove decorative separators
    cleaned = cleaned.replace(/^\s*-{3,}\s*$/gm, '');
    
    // Fix common syntax issues
    cleaned = cleaned.replace(/\([^)]*\)/g, ''); // Remove all parentheses from labels
    
    // Ensure proper line breaks
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove empty lines
    cleaned = cleaned.split('\n').filter(line => line.trim().length > 0).join('\n');
    
    console.log('Cleaned diagram:', cleaned);
    return cleaned.trim();
  };

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'monospace'
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      if (mermaidRef.current && !isEditing && editableChart.trim() && isMounted) {
        setIsRendering(true);
        
        try {
          // Clean previous content safely
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
          }
          
          const cleanedChart = cleanMermaidSyntax(editableChart);
          console.log('Rendering cleaned chart:', cleanedChart);
          
          // Use try-catch for individual render
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, cleanedChart);
          
          if (isMounted && mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (isMounted && mermaidRef.current) {
            mermaidRef.current.innerHTML = `
              <div class="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-800">
                <p class="font-semibold mb-2">⚠️ Diagram Rendering Error</p>
                <p class="text-sm text-red-300">${error instanceof Error ? error.message : 'Invalid Mermaid syntax'}</p>
                <p class="text-xs text-red-400 mt-2">Please check the diagram syntax or try refreshing.</p>
              </div>
            `;
          }
        } finally {
          if (isMounted) {
            setIsRendering(false);
          }
        }
      }
    };

    renderDiagram();
    
    return () => {
      isMounted = false;
      // Cleanup handled by React; avoid manual DOM removal to prevent removeChild errors
      // (Manual innerHTML clearing caused React to attempt to remove an already-detached node)
    };
  }, [editableChart, isEditing]);

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
    <Card className="w-full bg-gray-900/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-white">
          {title || 'Diagram'}
        </CardTitle>
        <div className="flex gap-2">
          {prompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyPromptToClipboard}
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {promptCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} <span className="ml-2">Copy Prompt</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} <span className="ml-2">Copy Diagram</span>
          </Button>
          {editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              ref={textareaRef}
              value={editableChart}
              onChange={(e) => setEditableChart(e.target.value)}
              className="w-full h-64 p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Mermaid diagram syntax..."
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            ref={mermaidRef}
            className="w-full overflow-auto bg-white rounded-lg p-4 min-h-[200px] flex items-center justify-center"
          >
            {isRendering && (
              <div className="text-gray-500">Rendering diagram...</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}