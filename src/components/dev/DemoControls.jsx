// ==============================================================================
// DEVELOPMENT DEMO CONTROLS (SAFETY ARCHITECTURE)
// Simulates 4:45 PM cutoff and generates test orders without modifying system clock
// Completely disabled and omitted in production
// ==============================================================================

import React, { useState } from 'react';
import { Clock, AlertTriangle, ShieldCheck, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { orderService } from '../../api/orderService';
import { useOrders } from '../../context/OrderContext';

export function DemoControls() {
  const { isDevMode, simulationActive, simulatedScenario, setScenario } = useSimulation();
  const { refetchOrders } = useOrders();
  const [injectedMessage, setInjectedMessage] = useState(null);

  // In production builds, this component is completely inactive
  if (!isDevMode) return null;

  // Injects an order placed 16 minutes ago to test TC-08 overdue alert instantly
  const injectOverdueOrder = async () => {
    try {
      const now = Date.now();
      const overdueTime = new Date(now - 16 * 60 * 1000).toISOString();
      
      const newOrder = {
        studentName: 'Simulated Student',
        rollNumber: 'IT-DEV-999',
        items: [
          { menu_item_id: 'menu-samosa-01', item_name: 'Crispy Samosa (2 pcs)', quantity: 2, unit_price: 30, subtotal: 60 }
        ],
        totalAmount: 60,
      };

      const placed = await orderService.placeOrder(newOrder);
      // Backdate the created_at timestamp in local storage or mock adapter
      if (placed && placed.id) {
        try {
          const raw = localStorage.getItem('canteen_mock_orders_v1');
          if (raw) {
            const list = JSON.parse(raw);
            const idx = list.findIndex(o => o.id === placed.id);
            if (idx !== -1) {
              list[idx].created_at = overdueTime;
              localStorage.setItem('canteen_mock_orders_v1', JSON.stringify(list));
            }
          }
        } catch (e) {}
      }

      await refetchOrders();
      setInjectedMessage('Injected order created 16m ago! Check /kitchen for the overdue warning.');
      setTimeout(() => setInjectedMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700 text-white text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Title */}
        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Lab Evaluation Demo Controls</span>
        </div>

        {/* Time Simulation Scenarios */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Simulate Canteen Time:</span>
          
          <button
            onClick={() => setScenario('real')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              !simulationActive ? 'bg-canteen-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            System Time
          </button>
          
          <button
            onClick={() => setScenario('normal')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              simulatedScenario === 'normal' && simulationActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            12:30 PM (Open)
          </button>

          <button
            onClick={() => setScenario('cutoff')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              simulatedScenario === 'cutoff' && simulationActive ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            4:46 PM (Cutoff)
          </button>

          <button
            onClick={() => setScenario('closed')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              simulatedScenario === 'closed' && simulationActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            5:30 PM (Closed)
          </button>
        </div>

        {/* Overdue Ticket Injection */}
        <div className="flex items-center space-x-2">
          <button
            onClick={injectOverdueOrder}
            className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Inject &gt;15m Overdue Ticket</span>
          </button>
        </div>
      </div>

      {injectedMessage && (
        <div className="mt-1 text-center text-emerald-400 font-medium text-[11px] animate-pulse">
          {injectedMessage}
        </div>
      )}
    </div>
  );
}
