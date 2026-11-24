// ==============================================================================
// APPLICATION ROOT & ROUTING SHELL
// ==============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { configurationError } from './api/client';
import { ConfigErrorBanner } from './components/common/ConfigErrorBanner';
import { SimulationProvider } from './context/SimulationContext';
import { MenuProvider } from './context/MenuContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { Navbar } from './components/common/Navbar';
import { DemoControls } from './components/dev/DemoControls';

// 6 Core Application Screens
import { StudentMenu } from './pages/StudentMenu';
import { ShoppingCart } from './pages/ShoppingCart';
import { OrderStatus } from './pages/OrderStatus';
import { KitchenBoard } from './pages/KitchenBoard';
import { NowServing } from './pages/NowServing';
import { AdminManager } from './pages/AdminManager';

export function App() {
  // Production Fail-Fast Guard: Halt execution if keys missing in production
  if (configurationError) {
    return <ConfigErrorBanner message={configurationError} />;
  }

  return (
    <SimulationProvider>
      <MenuProvider>
        <CartProvider>
          <OrderProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-surface-light text-slate-900 font-sans antialiased">
                {/* Dev-only Demo Controls Bar */}
                <DemoControls />

                {/* Responsive Global Navigation */}
                <Navbar />

                {/* 6 Core Screen Routes */}
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<StudentMenu />} />
                    <Route path="/cart" element={<ShoppingCart />} />
                    <Route path="/order/:id" element={<OrderStatus />} />
                    <Route path="/kitchen" element={<KitchenBoard />} />
                    <Route path="/display" element={<NowServing />} />
                    <Route path="/admin" element={<AdminManager />} />
                    <Route
                      path="*"
                      element={
                        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                          <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
                          <p className="text-sm text-slate-500 mb-6">Page not found</p>
                          <Link
                            to="/"
                            className="px-5 py-2.5 rounded-xl bg-canteen-500 text-white font-bold text-xs"
                          >
                            Return to Menu
                          </Link>
                        </div>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </OrderProvider>
        </CartProvider>
      </MenuProvider>
    </SimulationProvider>
  );
}

export default App;
