
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PasswordGeneratorProps {
  length: number;
  characterSets: {
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
  onPasswordsGenerated: (passwords: { weak: string; medium: string; strong: string }) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  length,
  characterSets,
  onPasswordsGenerated
}) => {
  const [passwords, setPasswords] = useState({
    weak: '',
    medium: '',
    strong: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const getCharacterSet = () => {
    let chars = '';
    if (characterSets.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (characterSets.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (characterSets.numbers) chars += '0123456789';
    if (characterSets.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return chars;
  };

  // Gerador Fraco - PRNG Simples com falhas
  const generateWeakPassword = () => {
    const weakChars = 'abcdefghijklmnopqrstuvwxyz0123456789'; // Alfabeto limitado
    let password = '';
    let seed = Date.now() % 1000; // Semente previsível baseada no tempo
    
    for (let i = 0; i < length; i++) {
      // LCG (Linear Congruential Generator) simples e fraco
      seed = (seed * 1103515245 + 12345) % Math.pow(2, 31);
      const index = Math.abs(seed) % weakChars.length;
      password += weakChars[index];
    }
    
    return password;
  };

  // Gerador Médio - PRNG Padrão
  const generateMediumPassword = () => {
    const chars = getCharacterSet();
    if (!chars) return '';
    
    let password = '';
    for (let i = 0; i < length; i++) {
      // Usa Math.random() - não é criptograficamente seguro
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    
    return password;
  };

  // Gerador Forte - CSPRNG
  const generateStrongPassword = () => {
    const chars = getCharacterSet();
    if (!chars) return '';
    
    let password = '';
    
    // Simula um CSPRNG usando crypto.getRandomValues quando disponível
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
      }
    } else {
      // Fallback para simulação de alta entropia
      for (let i = 0; i < length; i++) {
        const randomValue = Math.random() * Math.random() * Date.now() % chars.length;
        password += chars[Math.floor(randomValue)];
      }
    }
    
    return password;
  };

  const generateAllPasswords = async () => {
    setIsGenerating(true);
    
    // Simula tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPasswords = {
      weak: generateWeakPassword(),
      medium: generateMediumPassword(),
      strong: generateStrongPassword()
    };
    
    setPasswords(newPasswords);
    onPasswordsGenerated(newPasswords);
    setIsGenerating(false);
    
    toast({
      title: "Senhas geradas com sucesso!",
      description: "As senhas foram geradas usando diferentes tipos de geradores."
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: `Senha ${type} copiada para a área de transferência.`
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a senha.",
        variant: "destructive"
      });
    }
  };

  const getSecurityLevel = (type: string) => {
    switch (type) {
      case 'weak':
        return { label: 'Muito Fraca', color: 'bg-red-500', icon: X };
      case 'medium':
        return { label: 'Média', color: 'bg-yellow-500', icon: AlertTriangle };
      case 'strong':
        return { label: 'Forte', color: 'bg-green-500', icon: Check };
      default:
        return { label: 'Desconhecida', color: 'bg-gray-500', icon: X };
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Geração de Senhas</CardTitle>
          <CardDescription>
            Compare senhas geradas por diferentes tipos de geradores aleatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={generateAllPasswords} 
              disabled={isGenerating || !getCharacterSet()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Senhas
                </>
              )}
            </Button>
            
            {!getCharacterSet() && (
              <p className="text-sm text-red-600 text-center">
                Selecione pelo menos um conjunto de caracteres
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {(passwords.weak || passwords.medium || passwords.strong) && (
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { type: 'weak', title: 'Gerador Fraco (PRNG Simples)', description: 'Usa LCG com semente previsível e alfabeto limitado' },
            { type: 'medium', title: 'Gerador Médio (PRNG Padrão)', description: 'Usa Math.random() padrão da linguagem' },
            { type: 'strong', title: 'Gerador Forte (CSPRNG)', description: 'Usa gerador criptograficamente seguro' }
          ].map(({ type, title, description }) => {
            const security = getSecurityLevel(type);
            const SecurityIcon = security.icon;
            
            return (
              <Card key={type} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <Badge className={`${security.color} text-white`}>
                      <SecurityIcon className="w-3 h-3 mr-1" />
                      {security.label}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Input
                      value={passwords[type as keyof typeof passwords]}
                      readOnly
                      className="font-mono text-sm pr-10"
                      placeholder="Clique em 'Gerar Senhas' para começar"
                    />
                    {passwords[type as keyof typeof passwords] && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => copyToClipboard(passwords[type as keyof typeof passwords], type)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {passwords[type as keyof typeof passwords] && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Comprimento: {passwords[type as keyof typeof passwords].length} caracteres</p>
                      <p>Caracteres únicos: {new Set(passwords[type as keyof typeof passwords]).size}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
