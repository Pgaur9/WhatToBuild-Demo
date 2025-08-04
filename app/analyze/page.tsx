'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import '@/components/RepositoryIssuesScrollbar.css';
import axios from 'axios';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileCode2, FolderTree, GitBranch, Package, Database, Server, 
  Layout, Settings, Users, Lock, Globe, FileJson, FileText,
  Layers, ArrowRight, ChevronRight, ChevronDown, ExternalLink, 
  Info, AlertCircle, CheckCircle2, Zap, Workflow
} from 'lucide-react';
import { FileDetailsDialog } from '@/components/FileDetailsDialog';
import { RepositoryIssues } from '@/components/RepositoryIssues';
import RepositoryKeyFiles from '@/components/RepositoryKeyFiles';

interface FileSummary {
  path: string;
  summary: string;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  summary?: string;
  extension?: string;
  content?: string;
}

interface RepositoryStructure {
  files: FileNode[];
  components: string[];
  pages: string[];
  apis: string[];
  dataModels: string[];
  utilities: string[];
  configurations: string[];
}

interface RepositoryInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function getFileIcon(extension: string | undefined) {
  switch(extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode2 className="w-4 h-4 text-yellow-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-green-400" />;
    case 'md':
      return <FileText className="w-4 h-4 text-blue-400" />;
    case 'css':
    case 'scss':
    case 'sass':
      return <Layout className="w-4 h-4 text-purple-400" />;
    case 'html':
      return <Globe className="w-4 h-4 text-orange-400" />;
    case 'yml':
    case 'yaml':
      return <Settings className="w-4 h-4 text-gray-400" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400" />;
  }
}

function FileTree({ node, level = 0, onSelectFile }: { 
  node: FileNode; 
  level?: number; 
  onSelectFile: (file: FileNode) => void;
}) {
  const [isOpen, setIsOpen] = useState(level < 1);
  const isDirectory = node.type === 'directory';
  const hasChildren = isDirectory && node.children && node.children.length > 0;
  
  const extension = node.name.split('.').pop();
  
  return (
    <div className="animate-in fade-in slide-in-from-left-1 duration-300" style={{ animationDelay: `${level * 50}ms` }}>
      <div 
        className={`flex items-center py-1 px-2 rounded-md ${!isDirectory ? 'hover:bg-white/10 cursor-pointer' : ''} transition-colors duration-200`}
        onClick={() => {
          if (isDirectory && hasChildren) {
            setIsOpen(!isOpen);
          } else if (!isDirectory) {
            onSelectFile(node);
          }
        }}
      >
        <div className="mr-1">
          {isDirectory ? (
            isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : getFileIcon(extension)}
        </div>
        <span className={`text-sm ${isDirectory ? 'font-medium text-white' : 'text-white/80'}`}>
          {node.name}
        </span>
      </div>
      
      {isOpen && hasChildren && (
        <div className="ml-4 pl-2 border-l border-white/10">
          {node.children!.map((child, index) => (
            <FileTree 
              key={index} 
              node={child} 
              level={level + 1} 
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildFileTree(files: FileSummary[]): FileNode[] {
  const root: FileNode[] = [];
  
  files.forEach(file => {
    const pathParts = file.path.split('/');
    let currentLevel = root;
    
    pathParts.forEach((part, index) => {
      const isLastPart = index === pathParts.length - 1;
      const existingNode = currentLevel.find(node => node.name === part);
      
      if (existingNode) {
        if (isLastPart) {
          existingNode.summary = file.summary;
        }
        if (existingNode.children) {
          currentLevel = existingNode.children;
        }
      } else {
        const newNode: FileNode = {
          name: part,
          path: pathParts.slice(0, index + 1).join('/'),
          type: isLastPart ? 'file' : 'directory',
          extension: isLastPart ? part.split('.').pop() : undefined
        };
        
        if (isLastPart) {
          newNode.summary = file.summary;
        } else {
          newNode.children = [];
        }
        
        currentLevel.push(newNode);
        
        if (!isLastPart && newNode.children) {
          currentLevel = newNode.children;
        }
      }
    });
  });
  
  return root;
}

function categorizeFiles(files: FileSummary[]): RepositoryStructure {
  const structure: RepositoryStructure = {
    files: buildFileTree(files),
    components: [],
    pages: [],
    apis: [],
    dataModels: [],
    utilities: [],
    configurations: []
  };
  
  files.forEach(file => {
    const path = file.path.toLowerCase();
    
    if (path.includes('component') || path.includes('/ui/') || path.includes('/components/')) {
      structure.components.push(file.path);
    } else if (path.includes('/pages/') || path.includes('/page.') || path.includes('/views/')) {
      structure.pages.push(file.path);
    } else if (path.includes('/api/') || path.includes('controller') || path.includes('route.') || path.includes('endpoint')) {
      structure.apis.push(file.path);
    } else if (path.includes('model') || path.includes('schema') || path.includes('entity') || path.includes('type') || path.includes('interface')) {
      structure.dataModels.push(file.path);
    } else if (path.includes('util') || path.includes('helper') || path.includes('service') || path.includes('lib')) {
      structure.utilities.push(file.path);
    } else if (path.includes('config') || path.includes('.json') || path.includes('.yml') || path.includes('.env') || path.includes('.rc')) {
      structure.configurations.push(file.path);
    }
  });
  
  return structure;
}

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const repoFullName = searchParams.get('repo');

  const [summaries, setSummaries] = useState<FileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  
  // Use a ref to persist cached analysis results across renders
  const cachedAnalysisRef = React.useRef<{
    [key: string]: FileSummary[]
  }>({});

  const repoStructure = useMemo(() => {
    return categorizeFiles(summaries);
  }, [summaries]);

  const insights: RepositoryInsight[] = useMemo(() => [
    {
      title: 'UI Components',
      description: `${repoStructure.components.length} reusable interface elements`,
      icon: <Layout className="w-5 h-5 text-purple-400" />
    },
    {
      title: 'Pages/Views',
      description: `${repoStructure.pages.length} user-facing screens`,
      icon: <Globe className="w-5 h-5 text-blue-400" />
    },
    {
      title: 'API Endpoints',
      description: `${repoStructure.apis.length} data services`,
      icon: <Server className="w-5 h-5 text-green-400" />
    },
    {
      title: 'Data Models',
      description: `${repoStructure.dataModels.length} data structures`,
      icon: <Database className="w-5 h-5 text-yellow-400" />
    },
    {
      title: 'Utilities',
      description: `${repoStructure.utilities.length} helper functions`,
      icon: <Zap className="w-5 h-5 text-orange-400" />
    },
    {
      title: 'Configurations',
      description: `${repoStructure.configurations.length} config files`,
      icon: <Settings className="w-5 h-5 text-gray-400" />
    }
  ], [repoStructure]);

  const fetchFileContent = async (filePath: string) => {
    if (!repoFullName || !filePath) return;
    
    setFileLoading(true);
    try {
      const response = await axios.get(`/api/get-file-content?repo=${repoFullName}&path=${filePath}`);
      if (response.data.content) {
        // Update the selected file with content
        setSelectedFile(prev => prev ? {...prev, content: response.data.content} : null);
      }
    } catch (err) {
      console.error('Failed to fetch file content:', err);
      // Keep the selected file but without content
    } finally {
      setFileLoading(false);
    }
  };

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    setActiveTab('details');
    
    // If it's a file (not a directory), fetch its content and open the dialog
    if (file.type === 'file') {
      fetchFileContent(file.path);
      setIsFileDialogOpen(true);
    }
  };

  useEffect(() => {
    if (repoFullName) {
      const fetchAnalysis = async () => {
        // Check if we already have cached analysis for this repo
        if (cachedAnalysisRef.current[repoFullName]) {
          setSummaries(cachedAnalysisRef.current[repoFullName]);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`/api/analyze-repo?repo=${repoFullName}`);
          const summariesData = response.data.summaries;
          setSummaries(summariesData);
          
          // Cache the analysis results
          cachedAnalysisRef.current = {
            ...cachedAnalysisRef.current,
            [repoFullName]: summariesData
          };
        } catch (err) {
          console.error('Failed to fetch analysis:', err);
          setError('Could not analyze the repository. It may be private, empty, or an unexpected error occurred.');
        }
        setIsLoading(false);
      };

      fetchAnalysis();
    }
  }, [repoFullName]);

  if (!repoFullName) {
    return (
      <main className="container mx-auto px-4 py-8 pt-24 md:pt-32">
        <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-500">Error: Repository not specified.</h1>
          <p className="text-white/70">Please go back and select a repository to analyze.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 pt-24 md:pt-32">
      <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg relative group animate-in fade-in zoom-in-95 duration-500 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">Repository Analysis: <span className="text-green-400">{repoFullName}</span></h1>
          <p className="text-lg text-gray-400 mb-4">
            Insights and structure visualization for better understanding.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <a 
              href={`https://github.com/${repoFullName}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View on GitHub
            </a>
            <span className="inline-flex items-center gap-2 text-white/80 text-sm">
              <GitBranch className="w-4 h-4" />
              {summaries.length} files analyzed
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="w-full">
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg relative group animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="border-2 border-dashed border-white/10 bg-black/20 rounded-lg min-h-[500px] flex items-center justify-center p-8 m-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4">
                  <Workflow className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <p className="text-gray-400 text-xl animate-pulse">Analyzing the repository structure...</p>
                <p className="text-gray-500 mt-2">Building a comprehensive view of code organization and architecture</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg relative group animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="p-8 flex items-center gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-500">Analysis Error</h3>
              <p className="text-white/70 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-8">
          <div className="w-full">
            <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg relative group animate-in fade-in zoom-in-95 duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <div className="border-b border-white/10 px-6 pt-4">
                  <TabsList className="bg-black/40 border border-white/10">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
                      <Layout className="w-4 h-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="structure" className="data-[state=active]:bg-white/10">
                      <FolderTree className="w-4 h-4 mr-2" />
                      Structure
                    </TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-white/10">
                      <FileCode2 className="w-4 h-4 mr-2" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="keyfiles" className="data-[state=active]:bg-white/10">
                      <FileCode2 className="w-4 h-4 mr-2" />
                      Key Files
                    </TabsTrigger>
                    <TabsTrigger value="issues" className="data-[state=active]:bg-white/10">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Issues
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {insights.map((insight, index) => (
                      <div 
                        key={index} 
                        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-5"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-black/30 rounded-md">
                            {insight.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white">{insight.title}</h3>
                            <p className="text-white/70 text-sm mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3">Key File Categories</h3>
                    <div className="space-y-3">
                      {Object.entries(repoStructure).filter(([key]) => key !== 'files').map(([category, files]) => {
                        if (!Array.isArray(files) || files.length === 0) return null;
                        
                        return (
                          <div key={category} className="animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="text-white/80 text-sm font-medium mb-2 capitalize">{category} ({files.length})</h4>
                            <div>
                              <ul className="space-y-1">
                                {(files as string[]).slice(0, 5).map((file, idx) => (
                                  <li key={idx} className="text-white/60 text-xs truncate hover:text-white/90 transition-colors">
                                    {file}
                                  </li>
                                ))}
                                {(files as string[]).length > 5 && (
                                  <li className="text-white/40 text-xs italic">
                                    + {(files as string[]).length - 5} more files
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="structure" className="p-6">
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-indigo-400" />
                      Repository File Structure
                    </h3>
                    <div>
                      {repoStructure.files.map((node, index) => (
                        <FileTree 
                          key={index} 
                          node={node} 
                          onSelectFile={handleFileSelect} 
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-6">
                  {selectedFile ? (
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white flex items-center gap-2">
                          {getFileIcon(selectedFile.extension)}
                          <span className="ml-2">{selectedFile.path}</span>
                        </h3>
                        <Badge variant="outline" className="text-xs bg-white/10">
                          {selectedFile.extension?.toUpperCase() || 'FILE'}
                        </Badge>
                      </div>
                      
                      {/* File summary section */}
                      <div className="bg-black/40 rounded-lg p-4 border border-white/10 mb-4">
                        <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          Summary
                        </h4>
                        <p className="text-white/70">{selectedFile.summary || 'No summary available for this file.'}</p>
                      </div>
                      
                      {/* File details section */}
                      <div className="bg-black/40 rounded-lg p-4 border border-white/10 mb-4">
                        <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-purple-400" />
                          File Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-white/50 text-xs">File Path:</span>
                              <p className="text-white/80 text-sm">{selectedFile.path}</p>
                            </div>
                            <div>
                              <span className="text-white/50 text-xs">File Type:</span>
                              <p className="text-white/80 text-sm">{selectedFile.extension?.toUpperCase() || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-white/50 text-xs">File Name:</span>
                              <p className="text-white/80 text-sm">{selectedFile.name}</p>
                            </div>
                            <div>
                              <span className="text-white/50 text-xs">Type:</span>
                              <p className="text-white/80 text-sm capitalize">{selectedFile.type}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Related files section - placeholder for now */}
                      <div className="bg-black/40 rounded-lg p-4 border border-white/10 mb-4">
                        <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-green-400" />
                          Related Files
                        </h4>
                        <p className="text-white/60 text-sm italic">Files that might be related to this one based on imports and references.</p>
                      </div>
                      
                      {selectedFile.type === 'file' && (
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            className="bg-white/5 border-white/20 hover:bg-white/10"
                            onClick={() => {
                              fetchFileContent(selectedFile.path);
                              setIsFileDialogOpen(true);
                            }}
                          >
                            <FileCode2 className="w-4 h-4 mr-2" />
                            View File Content
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-8 text-center">
                      <Info className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-white mb-2">No File Selected</h3>
                      <p className="text-white/60 max-w-md mx-auto">
                        Select a file from the File Structure tab to view its details and summary.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4 bg-white/5 border-white/20 hover:bg-white/10"
                        onClick={() => setActiveTab('structure')}
                      >
                        <FolderTree className="w-4 h-4 mr-2" />
                        Browse File Structure
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="keyfiles" className="p-6 h-full overflow-auto hide-native-scrollbar">
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
                    <RepositoryKeyFiles repoFullName={repoFullName || ''} />
                  </div>
                </TabsContent>
                
                <TabsContent value="issues" className="p-6 h-full overflow-auto hide-native-scrollbar">
                  <div className="w-full">
                    <RepositoryIssues repoFullName={repoFullName || ''} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* File Details Dialog */}
      {selectedFile && (
        <FileDetailsDialog
          isOpen={isFileDialogOpen}
          onClose={() => setIsFileDialogOpen(false)}
          file={{
            path: selectedFile.path,
            name: selectedFile.name,
            extension: selectedFile.extension,
            content: selectedFile.content,
            summary: selectedFile.summary
          }}
          repoFullName={repoFullName || ''}
        />
      )}
    </main>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4">
            <Workflow className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <p className="text-xl text-white/80">Loading Repository Analysis...</p>
        </div>
      </div>
    }> 
      <AnalyzePageContent />
    </Suspense>
  );
}
