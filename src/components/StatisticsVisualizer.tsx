
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';

interface StatisticsVisualizerProps {
  passwords: {
    weak: string;
    medium: string;
    strong: string;
  };
  analysisResults: any;
  bruteForceResults: any;
}

export const StatisticsVisualizer: React.FC<StatisticsVisualizerProps> = ({
  passwords,
  analysisResults,
  bruteForceResults
}) => {
  if (!analysisResults || !bruteForceResults) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Visualização Estatística
          </CardTitle>
          <CardDescription>
            Execute a análise e simulação primeiro para visualizar os dados
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Dados de análise necessários</p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para os gráficos
  const entropyComparisonData = Object.entries(analysisResults.passwords).map(([type, data]: [string, any]) => ({
    name: type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte',
    'Entropia Shannon': parseFloat(data.shannonEntropy.toFixed(3)),
    'Entropia Total': parseFloat(data.totalEntropy.toFixed(2)),
    'Eficiência (%)': parseFloat(data.entropyEfficiency.toFixed(1)),
    'Caracteres Únicos': data.uniqueChars,
    'Score de Segurança': parseFloat(data.securityScore.toFixed(1))
  }));

  const timeComparisonData = Object.entries(bruteForceResults.passwords).map(([type, data]: [string, any]) => ({
    name: type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte',
    'Tempo Médio (log10)': Math.log10(data.bruteForce.average + 1),
    'Tempo Pior Caso (log10)': Math.log10(data.bruteForce.worst + 1),
    'Tentativas (log10)': Math.log10(data.bruteForce.attempts)
  }));

  // Dados de distribuição de caracteres
  const getCharacterDistributionData = () => {
    const data: any[] = [];
    Object.entries(analysisResults.passwords).forEach(([type, passwordData]: [string, any]) => {
      const dist = passwordData.distribution;
      const typeName = type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte';
      
      data.push({
        gerador: typeName,
        minúsculas: dist.lowercase,
        maiúsculas: dist.uppercase,
        números: dist.numbers,
        símbolos: dist.symbols
      });
    });
    return data;
  };

  const characterDistributionData = getCharacterDistributionData();

  // Dados para scatter plot (entropia vs tempo de quebra)
  const scatterData = Object.entries(analysisResults.passwords).map(([type, data]: [string, any]) => {
    const bruteData = bruteForceResults.passwords[type];
    return {
      name: type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte',
      entropia: data.totalEntropy,
      tempo: Math.log10(bruteData.bruteForce.average + 1),
      type
    };
  });

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981'];

  // Dados para gráfico de pizza de padrões
  const getPatternsData = (type: string) => {
    const data = analysisResults.passwords[type];
    if (!data) return [];
    
    return [
      { name: 'Padrões Sequenciais', value: data.patterns.sequential, color: '#EF4444' },
      { name: 'Padrões Repetitivos', value: data.patterns.repetitive, color: '#F97316' },
      { name: 'Padrões de Teclado', value: data.patterns.keyboard, color: '#EAB308' },
      { name: 'Caracteres Aleatórios', value: Math.max(0, data.length - data.patterns.sequential - data.patterns.repetitive - data.patterns.keyboard), color: '#22C55E' }
    ].filter(item => item.value > 0);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(analysisResults.passwords).map(([type, data]: [string, any]) => {
              const bruteData = bruteForceResults.passwords[type];
              const typeName = type === 'weak' ? 'Gerador Fraco' : type === 'medium' ? 'Gerador Médio' : 'Gerador Forte';
              
              return (
                <div key={type} className="bg-white/80 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{typeName}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Entropia:</span>
                      <Badge variant="outline">{data.totalEntropy.toFixed(1)} bits</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Eficiência:</span>
                      <Badge variant="outline">{data.entropyEfficiency.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo p/ quebrar:</span>
                      <Badge className={bruteData.security.color}>
                        {bruteData.security.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Comparação de Entropia */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Comparação de Entropia
          </CardTitle>
          <CardDescription>
            Análise comparativa da qualidade da aleatoriedade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={entropyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Entropia Shannon" fill="#3B82F6" name="Entropia Shannon (bits/char)" />
              <Bar dataKey="Eficiência (%)" fill="#10B981" name="Eficiência (%)" />
              <Bar dataKey="Score de Segurança" fill="#8B5CF6" name="Score de Segurança" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Distribuição de Caracteres */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Distribuição de Tipos de Caracteres</CardTitle>
          <CardDescription>
            Como cada gerador distribui os diferentes tipos de caracteres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={characterDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gerador" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="minúsculas" stackId="a" fill="#3B82F6" />
              <Bar dataKey="maiúsculas" stackId="a" fill="#10B981" />
              <Bar dataKey="números" stackId="a" fill="#F59E0B" />
              <Bar dataKey="símbolos" stackId="a" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scatter Plot: Entropia vs Tempo de Quebra */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Relação: Entropia vs Resistência a Ataques</CardTitle>
          <CardDescription>
            Correlação entre entropia (bits) e tempo para quebrar (escala log)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="entropia" 
                name="Entropia Total" 
                unit=" bits"
                label={{ value: 'Entropia Total (bits)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                dataKey="tempo" 
                name="Tempo" 
                unit=" (log10 s)"
                label={{ value: 'Tempo para Quebrar (log10 segundos)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string) => [
                  name === 'tempo' ? `10^${value.toFixed(2)} segundos` : `${value.toFixed(2)} bits`,
                  name === 'tempo' ? 'Tempo para Quebrar' : 'Entropia Total'
                ]}
              />
              <Scatter dataKey="tempo" fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise de Padrões */}
      <div className="grid gap-6 md:grid-cols-3">
        {['weak', 'medium', 'strong'].map((type) => {
          const typeName = type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte';
          const patternsData = getPatternsData(type);
          
          return (
            <Card key={type} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Padrões - {typeName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patternsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={patternsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      >
                        {patternsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum padrão detectado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tempo de Quebra Comparativo */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Tempo de Quebra por Força Bruta</CardTitle>
          <CardDescription>
            Comparação logarítmica do tempo necessário para quebrar cada senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Tempo (log10 segundos)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `10^${value.toFixed(2)} segundos`,
                  name.replace(' (log10)', '')
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Tempo Médio (log10)" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Tempo Médio"
              />
              <Line 
                type="monotone" 
                dataKey="Tempo Pior Caso (log10)" 
                stroke="#DC2626" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Pior Caso"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights e Conclusões */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Insights e Conclusões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-green-900">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">📊 Sobre a Aleatoriedade:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Geradores fracos mostram baixa entropia e padrões previsíveis</li>
                <li>PRNGs padrão são adequados para simulações, não para criptografia</li>
                <li>CSPRNGs oferecem entropia máxima e distribuição uniforme</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔒 Sobre a Segurança:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Cada bit adicional de entropia dobra o tempo de quebra</li>
                <li>Comprimento e diversidade de caracteres são cruciais</li>
                <li>Padrões reduzem drasticamente a segurança efetiva</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white/80 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Lição Principal:</strong> A qualidade da aleatoriedade é fundamental para a segurança criptográfica. 
              Usar geradores inadequados pode criar uma falsa sensação de segurança, mesmo com senhas aparentemente complexas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
