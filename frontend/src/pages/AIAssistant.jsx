import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Copy,
  Info
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button } from '../components/common/Button';
import { initialAiSuggestions } from '../data/mockData';
import { useToast } from '../context/ToastContext';

export const AIAssistant = () => {
  const { aiMessages, sendAiMessage, mrr, totalRevenueAtRisk, activeSubscriptionsCount } = useData();
  const { addToast } = useToast();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    setInputPrompt('');
    setIsTyping(true);

    sendAiMessage(text);

    setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  const handleCopy = (content) => {
    navigator.clipboard?.writeText(content);
    addToast({
      title: 'Copied to Clipboard',
      message: 'Analysis response copied.',
      type: 'info'
    });
  };

  // Simple renderer for assistant markdown tables and bold text
  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];

    lines.forEach((line, index) => {
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').filter(c => c.trim().length > 0).map(c => c.trim());
        if (cells.every(c => c.includes('---'))) {
          // delimiter
          return;
        }
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
      } else {
        if (inTable) {
          // flush table
          elements.push(
            <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    {tableHeaders.map((th, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 border-b border-slate-200">{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tableRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }

        if (line.startsWith('### ')) {
          elements.push(
            <h4 key={index} className="font-bold text-sm text-slate-900 mt-2 mb-1">
              {line.replace('### ', '')}
            </h4>
          );
        } else if (line.startsWith('- ')) {
          elements.push(
            <li key={index} className="ml-4 list-disc text-slate-700 text-xs my-0.5">
              {line.replace('- ', '')}
            </li>
          );
        } else if (line.trim().length > 0) {
          elements.push(
            <p key={index} className="text-xs text-slate-700 leading-relaxed my-1">
              {line}
            </p>
          );
        }
      }
    });

    if (inTable) {
      elements.push(
        <div key="table-end" className="my-3 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                {tableHeaders.map((th, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 border-b border-slate-200">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Business Assistant</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue-600 mr-1" />
              Intelligence Copilot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial queries, churn diagnostics, and revenue protection recommendations.
          </p>
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 flex-shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Suggested Queries:
        </span>
        {initialAiSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="flex-shrink-0 px-3 py-1 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 rounded-full text-xs text-slate-700 transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-6 overflow-y-auto space-y-5">
        {aiMessages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isAssistant ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isAssistant
                    ? 'bg-[#172554] text-white shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4 text-blue-400" /> : <User className="w-4 h-4 text-white" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-xl px-4 py-3 max-w-2xl text-xs ${
                  isAssistant
                    ? 'bg-slate-50/90 border border-slate-200 text-slate-800'
                    : 'bg-[#172554] text-white shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1 opacity-70 text-[10px]">
                  <span className="font-semibold">{isAssistant ? 'SubscriptIQ Copilot' : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="prose prose-xs max-w-none">
                  {isAssistant ? renderFormattedContent(msg.content) : <p className="leading-relaxed">{msg.content}</p>}
                </div>

                {isAssistant && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Info className="w-3 h-3 text-slate-400" />
                      <span>Synthesized from live database entities</span>
                    </span>
                    <button
                      onClick={() => handleCopy(msg.content)}
                      className="hover:text-slate-700 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-[#172554] flex items-center justify-center text-white">
              <Bot className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
            <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] text-slate-500 ml-1.5">Analyzing recurring financials...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-2 flex items-center space-x-2 flex-shrink-0">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything about billing cohorts, overdue invoices, dunning sequences, or MRR..."
          className="flex-1 px-3 py-2 text-xs bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-slate-800"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isTyping}
          icon={Send}
        >
          Ask Copilot
        </Button>
      </div>
    </div>
  );
};

