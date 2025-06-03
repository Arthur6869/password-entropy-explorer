
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Zap, Clock, Shield } from 'lucide-react';

interface BruteForceSimulatorProps {
  passwords: {
    weak: string;
    medium: string;
    strong: string;
  };
  analysisResults: any;
  onSimulationComplete: (results: any) => void;
}

export const BruteForceSimulator: React.FC<BruteForceSimulatorProps> = ({
  passwords,
  analysisResults,
  onSimulationComplete
}) => {
  const [attackPower, setAttackPower] = useState(1e9); // 1 bilhão de tentativas por segundo
  const [results, setResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customPower, setCustomPower] = useState('1000000000');

  const attackProfiles = {
    'hobby': { name: 'Hacker Amador', power: 1e6, description: 'CPU doméstico' },
    'criminal': { name: 'Criminoso', power: 1e9, description: 'GPU poderosa' },
    'organization': { name: 'Organização', power: 1e12, description: 'Cluster de GPUs' },
    'nation': { name: 'Estado-Nação', power: 1e15, description: 'Supercomputador' },
    'quantum': { name: 'Computador Quântico', power: 1e18, description: 'Tecnologia futura' }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)} milissegundos`;
    if (seconds < 60) return `${seconds.toFixed(2)} segundos`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutos`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} horas`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} dias`;
    if (seconds < 31536000000) return `${(seconds / 31536000).toFixed(2)} anos`;
    if (seconds < 31536000000000) return `${(seconds / 31536000000).toFixed(2)} mil anos`;
    if (seconds < 31536000000000000) return `${(seconds / 31536000000000).toFixed(2)} milhões de anos`;
    return `${(seconds / 31536000000000000).toFixed(2)} bilhões de anos`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e18) return `${(num / 1e18).toFixed(2)} quintilhões`;
    if (num >= 1e15) return `${(num / 1e15).toFixed(2)} quatrilhões`;
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} trilhões`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} bilhões`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} milhões`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)} mil`;
    return num.toFixed(0);
  };

  const calculateBruteForceTime = (password: string, entropy: number) => {
    if (!password || !entropy) return { worst: 0, average: 0, attempts: 0 };
    
    // Calcula o espaço de busca baseado na entropia real
    const searchSpace = Math.pow(2, entropy);
    
    // Tempo no pior caso (toda a chave)
    const worstCaseAttempts = searchSpace;
    const worstCaseTime = worstCaseAttempts / attackPower;
    
    // Tempo médio (metade do espaço)
    const averageAttempts = searchSpace / 2;
    const averageTime = averageAttempts / attackPower;
    
    return {
      worst: worstCaseTime,
      average: averageTime,
      attempts: searchSpace,
      worstAttempts: worstCaseAttempts,
      averageAttempts: averageAttempts
    };
  };

  const getSecurityLevel = (averageTime: number): { level: string; color: string; description: string } => {
    if (averageTime < 1) return { level: 'Crítico', color: 'bg-red-600', description: 'Quebrada instantaneamente' };
    if (averageTime < 3600) return { level: 'Muito Fraca', color: 'bg-red-500', description: 'Quebrada em minutos/horas' };
    if (averageTime < 86400) return { level: 'Fraca', color: 'bg-orange-500', description: 'Quebrada em horas/dias' };
    if (averageTime < 31536000) return { level: 'Regular', color: 'bg-yellow-500', description: 'Quebrada em dias/meses' };
    if (averageTime < 31536000 * 1000) return { level: 'Boa', color: 'bg-blue-500', description: 'Quebrada em anos/décadas' };
    if (averageTime < 31536000 * 1000000) return { level: 'Forte', color: 'bg-green-500', description: 'Quebrada em milênios' };
    return { level: 'Extremamente Forte', color: 'bg-green-600', description: 'Praticamente impossível de quebrar' };
  };

  const runSimulation = async () => {
    if (!analysisResults || !analysisResults.passwords) return;
    
    setIsSimulating(true);
    
    // Simula tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const simulationResults = {
      attackPower,
      attackProfile: Object.entries(attackProfiles).find(([_, profile]) => profile.power === attackPower)?.[1],
      passwords: {} as any
    };
    
    Object.entries(analysisResults.passwords).forEach(([type, data]: [string, any]) => {
      const bruteForce = calculateBruteForceTime(data.password, data.totalEntropy);
      const security = getSecurityLevel(bruteForce.average);
      
      simulationResults.passwords[type] = {
        ...data,
        bruteForce,
        security
      };
    });
    
    setResults(simulationResults);
    onSimulationComplete(simulationResults);
    setIsSimulating(false);
  };

  const handleCustomPowerChange = (value: string) => {
    setCustomPower(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAttackPower(numValue);
    }
  };

  if (!analysisResults) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Simulação de Força Bruta
          </CardTitle>
          <CardDescription>
            Execute a análise de entropia primeiro para simular ataques
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Dados de análise necessários</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuração do Ataque */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Configuração do Ataque
          </CardTitle>
          <CardDescription>
            Configure o poder computacional do atacante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Perfis Predefinidos */}
            <div className="space-y-4">
              <Label>Perfil do Atacante</Label>
              <div className="grid gap-2">
                {Object.entries(attackProfiles).map(([key, profile]) => (
                  <Button
                    key={key}
                    variant={attackPower === profile.power ? "default" : "outline"}
                    className="justify-start text-left h-auto p-3"
                    onClick={() => setAttackPower(profile.power)}
                  >
                    <div>
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(profile.power)} tentativas/s - {profile.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Configuração Customizada */}
            <div className="space-y-4">
              <Label>Poder Computacional Customizado</Label>
              <div className="space-y-3">
                <Input
                  type="number"
                  value={customPower}
                  onChange={(e) => handleCustomPowerChange(e.target.value)}
                  placeholder="Tentativas por segundo"
                />
                <div className="text-sm text-gray-600">
                  <p>Atual: {formatNumber(attackPower)} tentativas/segundo</p>
                  <p className="text-xs mt-1">
                    Referência: Uma GPU moderna pode fazer ~10⁹ tentativas/s para hashes simples
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            size="lg"
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Simulando Ataque...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Executar Simulação
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados da Simulação */}
      {results && (
        <div className="space-y-6">
          {/* Resumo */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Cenário de Ataque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold text-red-900">Atacante</h4>
                  <p className="text-sm text-red-700">
                    {results.attackProfile ? results.attackProfile.name : 'Personalizado'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900">Poder Computacional</h4>
                  <p className="text-sm text-red-700">{formatNumber(results.attackPower)}/s</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900">Método</h4>
                  <p className="text-sm text-red-700">Força Bruta Completa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados por Gerador */}
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(results.passwords).map(([type, data]: [string, any]) => {
              const typeName = type === 'weak' ? 'Fraco' : type === 'medium' ? 'Médio' : 'Forte';
              
              return (
                <Card key={type} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Gerador {typeName}</CardTitle>
                      <Badge className={`${data.security.color} text-white`}>
                        {data.security.level}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {data.security.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-sm mb-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Tempo para Quebrar
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tempo Médio:</span>
                            <span className="font-medium">
                              {formatTime(data.bruteForce.average)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pior Caso:</span>
                            <span className="font-medium">
                              {formatTime(data.bruteForce.worst)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-sm mb-2">Espaço de Busca</h5>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Tentativas Médias:</span>
                            <span>{formatNumber(data.bruteForce.averageAttempts)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Possível:</span>
                            <span>{formatNumber(data.bruteForce.attempts)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Entropia:</span>
                            <span>{data.totalEntropy.toFixed(2)} bits</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparação Visual */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Comparação de Resistência</CardTitle>
              <CardDescription>
                Tempo necessário para quebrar cada senha (escala logarítmica)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results.passwords).map(([type, data]: [string, any]) => {
                  const typeName = type === 'weak' ? 'Gerador Fraco' : type === 'medium' ? 'Gerador Médio' : 'Gerador Forte';
                  const percentage = Math.min(100, Math.log10(data.bruteForce.average + 1) * 10);
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{typeName}</span>
                        <span className="text-sm text-gray-600">
                          {formatTime(data.bruteForce.average)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Estes cálculos assumem ataques de força bruta pura. 
                  Ataques reais podem usar dicionários, regras e outras técnicas mais eficientes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
