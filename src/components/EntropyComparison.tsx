
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Copy, RefreshCw, AlertTriangle, Check, X, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EntropyComparisonProps {
  length: number;
  characterSets: {
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export const EntropyComparison: React.FC<EntropyComparisonProps> = ({
  length,
  characterSets
}) => {
  const [passwords, setPasswords] = useState({
    lowEntropy: '',
    highEntropy: ''
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getCharacterSet = () => {
    let chars = '';
    if (characterSets.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (characterSets.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (characterSets.numbers) chars += '0123456789';
    if (characterSets.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return chars;
  };

  // Gera senha com BAIXA entropia (muitos padrões e repetições)
  const generateLowEntropyPassword = () => {
    const patterns = ['123', 'abc', 'password', '111', 'aaa'];
    const commonChars = 'aeiou123';
    let password = '';
    
    // Adiciona padrões previsíveis
    for (let i = 0; i < Math.min(length, 6); i++) {
      if (i < 3) {
        password += patterns[0][i] || 'a';
      } else {
        password += commonChars[i % commonChars.length];
      }
    }
    
    // Completa com repetições
    while (password.length < length) {
      const repeatChar = password[password.length % 3] || 'a';
      password += repeatChar;
    }
    
    return password.substring(0, length);
  };

  // Gera senha com ALTA entropia (distribuição uniforme)
  const generateHighEntropyPassword = () => {
    const chars = getCharacterSet();
    if (!chars) return '';
    
    let password = '';
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        const randomValue = Math.random() * Math.random() * Date.now() % chars.length;
        password += chars[Math.floor(randomValue)];
      }
    }
    
    return password;
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

  const analyzePasswords = () => {
    const lowEntropy = calculateShannonEntropy(passwords.lowEntropy);
    const highEntropy = calculateShannonEntropy(passwords.highEntropy);
    
    const maxPossibleEntropy = Math.log2(getCharacterSet().length);
    
    const bruteForceTime = (entropy: number, attackPower = 1e9) => {
      const searchSpace = Math.pow(2, entropy * length);
      return searchSpace / (2 * attackPower); // Tempo médio
    };
    
    return {
      lowEntropy: {
        shannonEntropy: lowEntropy,
        totalEntropy: lowEntropy * passwords.lowEntropy.length,
        efficiency: (lowEntropy / maxPossibleEntropy) * 100,
        uniqueChars: new Set(passwords.lowEntropy).size,
        bruteForceTime: bruteForceTime(lowEntropy),
        patterns: {
          repetitions: passwords.lowEntropy.length - new Set(passwords.lowEntropy).size,
          sequential: (passwords.lowEntropy.match(/123|abc|234|bcd/gi) || []).length
        }
      },
      highEntropy: {
        shannonEntropy: highEntropy,
        totalEntropy: highEntropy * passwords.highEntropy.length,
        efficiency: (highEntropy / maxPossibleEntropy) * 100,
        uniqueChars: new Set(passwords.highEntropy).size,
        bruteForceTime: bruteForceTime(highEntropy),
        patterns: {
          repetitions: passwords.highEntropy.length - new Set(passwords.highEntropy).size,
          sequential: (passwords.highEntropy.match(/123|abc|234|bcd/gi) || []).length
        }
      },
      maxPossibleEntropy
    };
  };

  const generateComparison = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newPasswords = {
      lowEntropy: generateLowEntropyPassword(),
      highEntropy: generateHighEntropyPassword()
    };
    
    setPasswords(newPasswords);
    
    // Analisa após um pequeno delay para permitir o setState
    setTimeout(() => {
      const analysisResult = analyzePasswords();
      setAnalysis(analysisResult);
      setIsGenerating(false);
    }, 100);
    
    toast({
      title: "Comparativo gerado!",
      description: "Veja a diferença entre baixa e alta entropia de Shannon."
    });
  };

  // Atualiza análise quando as senhas mudam
  React.useEffect(() => {
    if (passwords.lowEntropy && passwords.highEntropy) {
      const analysisResult = analyzePasswords();
      setAnalysis(analysisResult);
    }
  }, [passwords]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: `Senha ${type} copiada.`
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`;
    if (seconds < 60) return `${seconds.toFixed(2)} segundos`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutos`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} horas`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} dias`;
    return `${(seconds / 31536000).toFixed(2)} anos`;
  };

  const chartData = analysis ? [
    {
      name: 'Baixa Entropia',
      'Entropia Shannon': analysis.lowEntropy.shannonEntropy.toFixed(3),
      'Eficiência (%)': analysis.lowEntropy.efficiency.toFixed(1),
      'Caracteres Únicos': analysis.lowEntropy.uniqueChars,
      'Tempo de Quebra (log)': Math.log10(analysis.lowEntropy.bruteForceTime + 1).toFixed(2)
    },
    {
      name: 'Alta Entropia',
      'Entropia Shannon': analysis.highEntropy.shannonEntropy.toFixed(3),
      'Eficiência (%)': analysis.highEntropy.efficiency.toFixed(1),
      'Caracteres Únicos': analysis.highEntropy.uniqueChars,
      'Tempo de Quebra (log)': Math.log10(analysis.highEntropy.bruteForceTime + 1).toFixed(2)
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-green-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Comparativo: Entropia de Shannon
          </CardTitle>
          <CardDescription>
            Veja a diferença prática entre senhas com baixa e alta entropia de Shannon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateComparison}
            disabled={isGenerating || !getCharacterSet()}
            className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Gerando Comparativo...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Gerar Comparativo de Entropia
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Comparativo das Senhas */}
      {passwords.lowEntropy && passwords.highEntropy && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Senha com Baixa Entropia */}
          <Card className="bg-red-50 border-red-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Baixa Entropia
                </CardTitle>
                <Badge className="bg-red-500 text-white">
                  Vulnerável
                </Badge>
              </div>
              <CardDescription className="text-red-700">
                Senha com padrões previsíveis e baixa aleatoriedade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="font-mono text-lg p-3 bg-white border-2 border-red-300 rounded">
                  {passwords.lowEntropy}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => copyToClipboard(passwords.lowEntropy, 'de baixa entropia')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {analysis && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-red-700">Entropia Shannon:</span>
                      <div className="font-bold text-red-800">
                        {analysis.lowEntropy.shannonEntropy.toFixed(3)} bits/char
                      </div>
                    </div>
                    <div>
                      <span className="text-red-700">Entropia Total:</span>
                      <div className="font-bold text-red-800">
                        {analysis.lowEntropy.totalEntropy.toFixed(2)} bits
                      </div>
                    </div>
                    <div>
                      <span className="text-red-700">Eficiência:</span>
                      <div className="font-bold text-red-800">
                        {analysis.lowEntropy.efficiency.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-red-700">Chars Únicos:</span>
                      <div className="font-bold text-red-800">
                        {analysis.lowEntropy.uniqueChars}/{passwords.lowEntropy.length}
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-100 p-3 rounded-lg">
                    <div className="text-sm text-red-700 mb-1">Tempo para quebrar:</div>
                    <div className="text-lg font-bold text-red-900">
                      {formatTime(analysis.lowEntropy.bruteForceTime)}
                    </div>
                  </div>

                  <div className="text-xs text-red-600">
                    <div>⚠ Repetições: {analysis.lowEntropy.patterns.repetitions}</div>
                    <div>⚠ Padrões sequenciais: {analysis.lowEntropy.patterns.sequential}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Senha com Alta Entropia */}
          <Card className="bg-green-50 border-green-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Alta Entropia
                </CardTitle>
                <Badge className="bg-green-500 text-white">
                  Segura
                </Badge>
              </div>
              <CardDescription className="text-green-700">
                Senha com distribuição uniforme e alta aleatoriedade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="font-mono text-lg p-3 bg-white border-2 border-green-300 rounded">
                  {passwords.highEntropy}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => copyToClipboard(passwords.highEntropy, 'de alta entropia')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {analysis && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-700">Entropia Shannon:</span>
                      <div className="font-bold text-green-800">
                        {analysis.highEntropy.shannonEntropy.toFixed(3)} bits/char
                      </div>
                    </div>
                    <div>
                      <span className="text-green-700">Entropia Total:</span>
                      <div className="font-bold text-green-800">
                        {analysis.highEntropy.totalEntropy.toFixed(2)} bits
                      </div>
                    </div>
                    <div>
                      <span className="text-green-700">Eficiência:</span>
                      <div className="font-bold text-green-800">
                        {analysis.highEntropy.efficiency.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-green-700">Chars Únicos:</span>
                      <div className="font-bold text-green-800">
                        {analysis.highEntropy.uniqueChars}/{passwords.highEntropy.length}
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="text-sm text-green-700 mb-1">Tempo para quebrar:</div>
                    <div className="text-lg font-bold text-green-900">
                      {formatTime(analysis.highEntropy.bruteForceTime)}
                    </div>
                  </div>

                  <div className="text-xs text-green-600">
                    <div>✓ Repetições: {analysis.highEntropy.patterns.repetitions}</div>
                    <div>✓ Padrões sequenciais: {analysis.highEntropy.patterns.sequential}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico Comparativo */}
      {analysis && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Comparação Visual</CardTitle>
            <CardDescription>
              Diferenças quantitativas entre baixa e alta entropia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Entropia Shannon" fill="#DC2626" name="Entropia Shannon" />
                <Bar dataKey="Eficiência (%)" fill="#16A34A" name="Eficiência (%)" />
                <Bar dataKey="Caracteres Únicos" fill="#2563EB" name="Caracteres Únicos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Explicação Didática */}
      {analysis && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p><strong>O que a Entropia de Shannon nos mostra:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Baixa Entropia ({analysis.lowEntropy.shannonEntropy.toFixed(3)} bits/char):</strong> 
                  Padrões previsíveis tornam a senha {Math.pow(2, (analysis.highEntropy.totalEntropy - analysis.lowEntropy.totalEntropy)).toExponential(2)} vezes mais fácil de quebrar
                </li>
                <li>
                  <strong>Alta Entropia ({analysis.highEntropy.shannonEntropy.toFixed(3)} bits/char):</strong> 
                  Distribuição uniforme maximiza a aleatoriedade e o tempo de quebra
                </li>
                <li>
                  <strong>Diferença de Tempo:</strong> A senha de alta entropia leva {(analysis.highEntropy.bruteForceTime / analysis.lowEntropy.bruteForceTime).toExponential(2)} vezes mais tempo para ser quebrada
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
