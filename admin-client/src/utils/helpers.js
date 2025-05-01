// admin-client/src/utils/helpers.js

/**
 * Gera um ID único para ser usado nos nós do fluxo
 * @returns {string} ID único
 */
export function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Converte um fluxo para formato compatível com o bot WhatsApp
   * @param {Object} flowData Dados do fluxo do editor
   * @returns {Object} Estrutura de dados processada para o bot
   */
  export function convertFlowToBot(flowData) {
    const { nodes, edges } = flowData;
    
    // Verifica se há nós e bordas
    if (!nodes || !edges) {
      return { error: 'Fluxo inválido: nós ou bordas ausentes' };
    }
    
    // Encontra o nó inicial
    const startNode = nodes.find(node => node.id === 'start-node');
    if (!startNode) {
      return { error: 'Fluxo inválido: nó inicial não encontrado' };
    }
    
    // Constrói um mapa de nós para referência rápida
    const nodesMap = {};
    nodes.forEach(node => {
      nodesMap[node.id] = {
        ...node,
        connections: []
      };
    });
    
    // Adiciona informações de conexão a cada nó
    edges.forEach(edge => {
      const sourceNode = nodesMap[edge.source];
      const targetNode = nodesMap[edge.target];
      
      if (sourceNode && targetNode) {
        sourceNode.connections.push({
          target: edge.target,
          // Para nós condicionais, identifica se é saída positiva ou negativa
          label: edge.sourceHandle === 'false-output' ? 'false' : 'true'
        });
      }
    });
    
    // Converte para estrutura compatível com o bot
    const botFlow = {
      id: flowData.id,
      name: flowData.name,
      startNodeId: startNode.id,
      nodes: {}
    };
    
    // Processa cada nó para o formato do bot
    Object.keys(nodesMap).forEach(nodeId => {
      const node = nodesMap[nodeId];
      
      // Objeto base para todos os tipos de nó
      const baseNode = {
        type: node.type,
        data: node.data,
        next: null
      };
      
      // Processa as próximas etapas com base no tipo de nó
      if (node.type === 'conditionalNode') {
        // Nós condicionais têm caminhos diferentes com base na condição
        const trueConnection = node.connections.find(conn => conn.label === 'true');
        const falseConnection = node.connections.find(conn => conn.label === 'false');
        
        baseNode.next = {
          true: trueConnection ? trueConnection.target : null,
          false: falseConnection ? falseConnection.target : null
        };
      } else if (node.connections.length > 0) {
        // Outros nós seguem um caminho linear
        baseNode.next = node.connections[0].target;
      }
      
      // Adiciona o nó processado à estrutura do bot
      botFlow.nodes[nodeId] = baseNode;
    });
    
    return botFlow;
  }
  
  /**
   * Valida um fluxo para garantir que é adequado para uso no bot
   * @param {Object} flowData Dados do fluxo do editor
   * @returns {Object} Resultado da validação
   */
  export function validateFlow(flowData) {
    const { nodes, edges } = flowData;
    const issues = [];
    
    // Verifica se há nós e bordas
    if (!nodes || nodes.length === 0) {
      issues.push('O fluxo não contém nós');
    }
    
    if (!edges || edges.length === 0) {
      issues.push('O fluxo não contém conexões entre nós');
    }
    
    // Encontra o nó inicial
    const startNode = nodes ? nodes.find(node => node.id === 'start-node') : null;
    if (!startNode) {
      issues.push('Nó inicial não encontrado');
    }
    
    // Constrói um mapa de nós para referência rápida
    const nodesMap = {};
    if (nodes) {
      nodes.forEach(node => {
        nodesMap[node.id] = {
          ...node,
          incomingConnections: 0
        };
      });
      
      // Verifica conexões de entrada para cada nó
      if (edges) {
        edges.forEach(edge => {
          if (nodesMap[edge.target]) {
            nodesMap[edge.target].incomingConnections += 1;
          }
        });
      }
      
      // Verifica nós sem conexões de entrada (além do inicial)
      nodes.forEach(node => {
        if (node.id !== 'start-node' && nodesMap[node.id].incomingConnections === 0) {
          issues.push(`O nó "${node.data.label}" não possui conexões de entrada`);
        }
      });
      
      // Verifica nós terminais (sem saída)
      let hasTerminalNode = false;
      if (edges) {
        const outgoingConnections = {};
        edges.forEach(edge => {
          if (!outgoingConnections[edge.source]) {
            outgoingConnections[edge.source] = 0;
          }
          outgoingConnections[edge.source] += 1;
        });
        
        // Verifica se existe pelo menos um nó terminal
        nodes.forEach(node => {
          if (!outgoingConnections[node.id]) {
            hasTerminalNode = true;
          }
        });
        
        if (!hasTerminalNode) {
          issues.push('O fluxo não tem um ponto de término (nó terminal)');
        }
      }
      
      // Verifica nós de mensagem sem conteúdo
      nodes.forEach(node => {
        if ((node.type === 'messageNode' || node.type === 'questionNode') && 
            (!node.data.content || node.data.content.trim() === '')) {
          issues.push(`O nó "${node.data.label}" não tem conteúdo de mensagem definido`);
        }
      });
      
      // Verifica nós de pergunta sem opções
      nodes.forEach(node => {
        if (node.type === 'questionNode' && 
            (!node.data.options || node.data.options.trim() === '')) {
          issues.push(`O nó de pergunta "${node.data.label}" não tem opções definidas`);
        }
      });
      
      // Verifica nós condicionais sem valor de condição
      nodes.forEach(node => {
        if (node.type === 'conditionalNode' && 
            (!node.data.conditionValue || node.data.conditionValue.trim() === '')) {
          issues.push(`O nó condicional "${node.data.label}" não tem valor de condição definido`);
        }
      });
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }