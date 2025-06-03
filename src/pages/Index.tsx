
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

const Index = () => {
  const [passwordLength, setPasswordLength] = useState(12);
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
              Defina os parâmetros para geração e análise das senhas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Comprimento da Senha: {passwordLength}</Label>
                  <Input
                    type="range"
                    min="4"
                    max="32"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(Number(e.target.value))}
                    className="w-full"
                  />
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
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="generator">Geração</TabsTrigger>
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

        {/* Security Warning */}
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
