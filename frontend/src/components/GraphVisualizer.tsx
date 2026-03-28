import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sparkles, Info } from 'lucide-react';
import axios from 'axios';

interface GraphVisualizerProps {
  exampleInput: string;
  problemTitle: string;
  isDirected?: boolean;
}

const GraphVisualizer = ({ exampleInput, problemTitle, isDirected = false }: GraphVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'english' | 'gujarati'>('english');
  const [showExplanation, setShowExplanation] = useState(false);

  // Parse graph data from example input
  const parseGraphData = useCallback((input: string) => {
    try {
      // Remove extra whitespace and newlines
      const cleanInput = input.trim();
      
      // Try to parse as JSON first
      let graphData: any;
      try {
        graphData = JSON.parse(cleanInput);
      } catch {
        // If not JSON, try to parse as array notation
        const arrayMatch = cleanInput.match(/\[\[.*?\]\]/s);
        if (arrayMatch) {
          graphData = JSON.parse(arrayMatch[0]);
        } else {
          // Try to parse as simple edge list
          const lines = cleanInput.split('\n');
          graphData = lines.map(line => {
            const parts = line.trim().split(/[\s,]+/);
            return parts.map(p => parseInt(p)).filter(n => !isNaN(n));
          }).filter(arr => arr.length > 0);
        }
      }

      // Detect graph format and parse accordingly
      let parsedNodes: Node[] = [];
      let parsedEdges: Edge[] = [];
      let nodeSet = new Set<number>();

      // Format 1: Adjacency List [[1,2], [0,2], [0,1]]
      if (Array.isArray(graphData) && graphData.length > 0 && Array.isArray(graphData[0])) {
        graphData.forEach((neighbors: number[], nodeId: number) => {
          nodeSet.add(nodeId);
          neighbors.forEach((neighbor: number) => {
            nodeSet.add(neighbor);
            parsedEdges.push({
              id: `e${nodeId}-${neighbor}`,
              source: String(nodeId),
              target: String(neighbor),
              type: 'smoothstep',
              animated: true,
              markerEnd: isDirected ? { type: MarkerType.ArrowClosed } : undefined,
            });
          });
        });
      }
      // Format 2: Edge List [[0,1], [1,2], [2,0]]
      else if (Array.isArray(graphData) && graphData.length > 0 && 
               Array.isArray(graphData[0]) && graphData[0].length === 2) {
        graphData.forEach((edge: number[], idx: number) => {
          const [from, to] = edge;
          nodeSet.add(from);
          nodeSet.add(to);
          parsedEdges.push({
            id: `e${idx}`,
            source: String(from),
            target: String(to),
            type: 'smoothstep',
            animated: true,
            markerEnd: isDirected ? { type: MarkerType.ArrowClosed } : undefined,
          });
        });
      }
      // Format 3: Object with nodes and edges
      else if (graphData.nodes && graphData.edges) {
        graphData.nodes.forEach((node: any) => {
          nodeSet.add(typeof node === 'object' ? node.id : node);
        });
        graphData.edges.forEach((edge: any, idx: number) => {
          const from = typeof edge === 'object' ? edge.from : edge[0];
          const to = typeof edge === 'object' ? edge.to : edge[1];
          parsedEdges.push({
            id: `e${idx}`,
            source: String(from),
            target: String(to),
            type: 'smoothstep',
            animated: true,
            markerEnd: isDirected ? { type: MarkerType.ArrowClosed } : undefined,
          });
        });
      }

      // Create nodes in a circular layout
      const nodeArray = Array.from(nodeSet).sort((a, b) => a - b);
      const radius = Math.max(150, nodeArray.length * 30);
      const centerX = 300;
      const centerY = 250;

      parsedNodes = nodeArray.map((nodeId, index) => {
        const angle = (2 * Math.PI * index) / nodeArray.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        return {
          id: String(nodeId),
          position: { x, y },
          data: { label: String(nodeId) },
          style: {
            background: '#6366f1',
            color: 'white',
            border: '2px solid #4f46e5',
            borderRadius: '50%',
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        };
      });

      setNodes(parsedNodes);
      setEdges(parsedEdges);
    } catch (error) {
      console.error('Failed to parse graph data:', error);
      // Show error state
      setNodes([{
        id: 'error',
        position: { x: 250, y: 200 },
        data: { label: 'Unable to parse graph' },
        style: { background: '#ef4444', color: 'white', padding: 10 },
      }]);
      setEdges([]);
    }
  }, [isDirected, setNodes, setEdges]);

  useEffect(() => {
    if (exampleInput) {
      parseGraphData(exampleInput);
    }
  }, [exampleInput, parseGraphData]);

  const handleExplainGraph = async () => {
    setLoading(true);
    setShowExplanation(true);
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await axios.post(
        `${API_URL}/api/dsa/explain-graph`,
        {
          graph_data: exampleInput,
          problem_title: problemTitle,
          language: language,
          is_directed: isDirected,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setExplanation(response.data.explanation);
    } catch (error: any) {
      console.error('Failed to get explanation:', error);
      setExplanation(
        language === 'gujarati'
          ? 'માફ કરશો, ગ્રાફની સમજૂતી મેળવવામાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.'
          : 'Sorry, failed to get graph explanation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-900">
            Interactive Graph Visualization - Drag nodes to explore
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'english' | 'gujarati')}
            className="px-3 py-1.5 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="english">English</option>
            <option value="gujarati">ગુજરાતી</option>
          </select>
          <button
            onClick={handleExplainGraph}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Explaining...' : 'Explain Graph'}
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden" style={{ height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* AI Explanation */}
      {showExplanation && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === 'gujarati' ? 'AI સમજૂતી' : 'AI Explanation'}
              </h3>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-indigo-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-indigo-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-indigo-200 rounded animate-pulse w-4/6"></div>
                </div>
              ) : (
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {explanation}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend:</h4>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-full border-2 border-indigo-800"></div>
            <span>Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-gray-400"></div>
            {isDirected && <span>→</span>}
            <span>{isDirected ? 'Directed Edge' : 'Edge'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">💡 Tip: Drag nodes to rearrange the graph</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
