import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { EntropyAnalyzer } from '@/components/EntropyAnalyzer';
import { BruteForceSimulator } from '@/components/BruteForceSimulator';
import { StatisticsVisualizer } from '@/components/StatisticsVisualizer';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import { EntropyComparison } from '@/components/EntropyComparison';

const Index = () => {
  const [passwordLength, setPasswordLength] = useState(16);
  const [characterSets, setCharacterSets] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  });
  const [generatedPasswords, setGeneratedPasswords] = useState({
    weak: '',
    medium: '',
    strong: ''
  });
  const [analysisResults, setAnalysisResults] = useState(null);
  const [bruteForceResults, setBruteForceResults] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Simulador de Segurança Criptográfica
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore como probabilidade e estatística determinam a força de senhas e chaves criptográficas
          </p>
        </div>

        {/* Configuration Panel */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Configuração de Parâmetros
            </CardTitle>
            <CardDescription>
              Defina os parâmetros para geração e análise das senhas (até 64 caracteres para máxima segurança)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Comprimento da Senha: {passwordLength} caracteres</Label>
                  <Input
                    type="range"
                    min="4"
                    max="64"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>4 (Muito Fraca)</span>
                    <span>16 (Recomendado)</span>
                    <span>32 (Forte)</span>
                    <span>64 (Máxima)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Conjuntos de Caracteres</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(characterSets).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={value}
                        onChange={(e) => setCharacterSets(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key === 'lowercase' ? 'Minúsculas (a-z)' :
                         key === 'uppercase' ? 'Maiúsculas (A-Z)' :
                         key === 'numbers' ? 'Números (0-9)' :
                         'Símbolos (!@#$...)'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicador de Segurança */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nível de Segurança Estimado:</span>
                <Badge className={
                  passwordLength >= 32 ? 'bg-green-500' :
                  passwordLength >= 16 ? 'bg-blue-500' :
                  passwordLength >= 12 ? 'bg-yellow-500' :
                  'bg-red-500'
                }>
                  {passwordLength >= 32 ? 'Extremamente Forte' :
                   passwordLength >= 16 ? 'Muito Forte' :
                   passwordLength >= 12 ? 'Forte' :
                   passwordLength >= 8 ? 'Médio' : 'Fraco'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {passwordLength >= 32 ? 'Resistente a ataques por milhares de anos mesmo com supercomputadores' :
                 passwordLength >= 16 ? 'Excelente proteção contra ataques modernos' :
                 passwordLength >= 12 ? 'Adequado para a maioria dos usos' :
                 'Pode ser vulnerável a ataques avançados'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="generator">Geração</TabsTrigger>
            <TabsTrigger value="comparison">Comparativo</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="bruteforce">Força Bruta</TabsTrigger>
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <PasswordGenerator
              length={passwordLength}
              characterSets={characterSets}
              onPasswordsGenerated={setGeneratedPasswords}
            />
          </TabsContent>

          <TabsContent value="comparison">
            <EntropyComparison
              length={passwordLength}
              characterSets={characterSets}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <EntropyAnalyzer
              passwords={generatedPasswords}
              characterSets={characterSets}
              onAnalysisComplete={setAnalysisResults}
            />
          </TabsContent>

          <TabsContent value="bruteforce">
            <BruteForceSimulator
              passwords={generatedPasswords}
              analysisResults={analysisResults}
              onSimulationComplete={setBruteForceResults}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsVisualizer
              passwords={generatedPasswords}
              analysisResults={analysisResults}
              bruteForceResults={bruteForceResults}
            />
          </TabsContent>
        </Tabs>

        <Alert className="bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Aviso:</strong> Este é um simulador educacional. As senhas geradas aqui não devem ser usadas em aplicações reais.
            Sempre use geradores criptograficamente seguros para senhas em produção.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Index;
