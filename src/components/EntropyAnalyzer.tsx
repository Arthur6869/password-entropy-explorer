
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';

interface EntropyAnalyzerProps {
  passwords: {
    weak: string;
    medium: string;
    strong: string;
  };
  characterSets: {
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
  onAnalysisComplete: (results: any) => void;
}

export const EntropyAnalyzer: React.FC<EntropyAnalyzerProps> = ({
  passwords,
  characterSets,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const calculateTheoricalEntropy = () => {
    let alphabetSize = 0;
    if (characterSets.lowercase) alphabetSize += 26;
    if (characterSets.uppercase) alphabetSize += 26;
    if (characterSets.numbers) alphabetSize += 10;
    if (characterSets.symbols) alphabetSize += 32; // Aproximadamente
    
    return alphabetSize;
  };

  const calculateShannonEntropy = (password: string) => {
    if (!password) return 0;
    
    const frequencies: { [key: string]: number } = {};
    for (const char of password) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = password.length;
    
    for (const freq of Object.values(frequencies)) {
      const probability = freq / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  };

  const analyzeCharacterDistribution = (password: string) => {
    const distribution = {
      lowercase: 0,
      uppercase: 0,
      numbers: 0,
      symbols: 0,
      total: password.length
    };
    
    for (const char of password) {
      if (/[a-z]/.test(char)) distribution.lowercase++;
      else if (/[A-Z]/.test(char)) distribution.uppercase++;
      else if (/[0-9]/.test(char)) distribution.numbers++;
      else distribution.symbols++;
    }
    
    return distribution;
  };

  const calculateRepetitionScore = (password: string) => {
    if (!password) return 0;
    
    const uniqueChars = new Set(password).size;
    return (uniqueChars / password.length) * 100;
  };

  const analyzePatterns = (password: string) => {
    if (!password) return { sequential: 0, repetitive: 0, keyboard: 0 };
    
    let sequential = 0;
    let repetitive = 0;
    let keyboard = 0;
    
    // Detecta padrões sequenciais
    for (let i = 0; i < password.length - 2; i++) {
      const a = password.charCodeAt(i);
      const b = password.charCodeAt(i + 1);
      const c = password.charCodeAt(i + 2);
      
      if (b - a === 1 && c - b === 1) sequential++;
    }
    
    // Detecta repetições
    for (let i = 0; i < password.length - 1; i++) {
      if (password[i] === password[i + 1]) repetitive++;
    }
    
    // Detecta padrões de teclado simples
    const keyboardPatterns = ['123', 'abc', 'qwe', 'asd', 'zxc'];
    for (const pattern of keyboardPatterns) {
      if (password.toLowerCase().includes(pattern)) keyboard++;
    }
    
    return { sequential, repetitive, keyboard };
  };

  const performAnalysis = async () => {
    if (!passwords.weak && !passwords.medium && !passwords.strong) return;
    
    setIsAnalyzing(true);
    
    // Simula tempo de análise
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const theoricalAlphabetSize = calculateTheoricalEntropy();
    
    const results = {
      theoretical: {
        alphabetSize: theoricalAlphabetSize,
        maxEntropyPerChar: Math.log2(theoricalAlphabetSize),
        maxTotalEntropy: Math.log2(theoricalAlphabetSize) * (passwords.weak?.length || passwords.medium?.length || passwords.strong?.length || 0)
      },
      passwords: {} as any
    };
    
    ['weak', 'medium', 'strong'].forEach(type => {
      const password = passwords[type as keyof typeof passwords];
      if (password) {
        const shannonEntropy = calculateShannonEntropy(password);
        const distribution = analyzeCharacterDistribution(password);
        const repetitionScore = calculateRepetitionScore(password);
        const patterns = analyzePatterns(password);
        const totalEntropy = shannonEntropy * password.length;
        const entropyEfficiency = (totalEntropy / results.theoretical.maxTotalEntropy) * 100;
        
        results.passwords[type] = {
          password,
          length: password.length,
          uniqueChars: new Set(password).size,
          shannonEntropy,
          totalEntropy,
          entropyEfficiency,
          distribution,
          repetitionScore,
          patterns,
          securityScore: Math.min(100, (entropyEfficiency + repetitionScore) / 2)
        };
      }
    });
    
    setAnalysis(results);
    onAnalysisComplete(results);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (passwords.weak || passwords.medium || passwords.strong) {
      performAnalysis();
    }
  }, [passwords]);

  const getEntropyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    if (efficiency >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSecurityBadge = (score: number) => {
    if (score >= 80) return { label: 'Excelente', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Boa', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Regular', color: 'bg-yellow-500' };
    if (score >= 20) return { label: 'Fraca', color: 'bg-orange-500' };
    return { label: 'Muito Fraca', color: 'bg-red-500' };
  };

  const chartData = analysis ? Object.entries(analysis.passwords).map(([type, data]: [string, any]) => ({
    name: type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte',
    'Entropia Shannon': data.shannonEntropy.toFixed(2),
    'Entropia Total': data.totalEntropy.toFixed(2),
    'Eficiência (%)': data.entropyEfficiency.toFixed(1),
    'Score de Segurança': data.securityScore.toFixed(1)
  })) : [];

  if (!analysis && !isAnalyzing) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Análise de Entropia
          </CardTitle>
          <CardDescription>
            Gere senhas primeiro para visualizar a análise estatística
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma senha para analisar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Teórico */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Análise de Entropia
          </CardTitle>
          <CardDescription>
            Análise estatística da aleatoriedade e força das senhas geradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Analisando entropia e padrões...</p>
            </div>
          ) : analysis && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">Tamanho do Alfabeto</h4>
                <p className="text-2xl font-bold text-blue-600">{analysis.theoretical.alphabetSize}</p>
                <p className="text-sm text-blue-700">caracteres possíveis</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900">Entropia Máxima/Char</h4>
                <p className="text-2xl font-bold text-purple-600">{analysis.theoretical.maxEntropyPerChar.toFixed(2)}</p>
                <p className="text-sm text-purple-700">bits por caractere</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900">Entropia Total Máxima</h4>
                <p className="text-2xl font-bold text-green-600">{analysis.theoretical.maxTotalEntropy.toFixed(2)}</p>
                <p className="text-sm text-green-700">bits total</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise Individual */}
      {analysis && (
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(analysis.passwords).map(([type, data]: [string, any]) => {
            const badge = getSecurityBadge(data.securityScore);
            const typeName = type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte';
            
            return (
              <Card key={type} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Gerador {typeName}</CardTitle>
                    <Badge className={`${badge.color} text-white`}>
                      {badge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Entropia Shannon</span>
                        <span className={getEntropyColor(data.entropyEfficiency)}>
                          {data.shannonEntropy.toFixed(3)} bits/char
                        </span>
                      </div>
                      <Progress value={data.entropyEfficiency} className="h-2 mt-1" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Entropia Total</span>
                        <span className="font-medium">{data.totalEntropy.toFixed(2)} bits</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Eficiência</span>
                        <span className={getEntropyColor(data.entropyEfficiency)}>
                          {data.entropyEfficiency.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Caracteres Únicos</span>
                        <span>{data.uniqueChars}/{data.length}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Score de Repetição</span>
                        <span>{data.repetitionScore.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Padrões Detectados */}
                  <div className="border-t pt-3">
                    <h5 className="text-sm font-semibold mb-2">Padrões Detectados</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Sequenciais:</span>
                        <span className={data.patterns.sequential > 0 ? 'text-red-600' : 'text-green-600'}>
                          {data.patterns.sequential}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Repetitivos:</span>
                        <span className={data.patterns.repetitive > 0 ? 'text-red-600' : 'text-green-600'}>
                          {data.patterns.repetitive}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Teclado:</span>
                        <span className={data.patterns.keyboard > 0 ? 'text-red-600' : 'text-green-600'}>
                          {data.patterns.keyboard}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Gráfico Comparativo */}
      {analysis && chartData.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Comparação de Entropia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Entropia Shannon" fill="#3B82F6" />
                <Bar dataKey="Eficiência (%)" fill="#10B981" />
                <Bar dataKey="Score de Segurança" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
