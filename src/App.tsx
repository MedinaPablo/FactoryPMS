import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { User, Venture, CostItem, Product, Budget, ProductionOrder } from './types';
import { Navbar } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { CostsManager } from './components/CostsManager';
import { ProductsManager } from './components/ProductsManager';
import { BudgetsManager } from './components/BudgetsManager';
import { ProductionManager } from './components/ProductionManager';
import { VenturesManager } from './components/VenturesManager';
import { UsersManager } from './components/UsersManager';
import { DatabaseToolsModal } from './components/DatabaseToolsModal';
import { UserManualModal } from './components/UserManualModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [activeVentureId, setActiveVentureId] = useState<string>(() => storage.getActiveVentureId());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Database snapshot state
  const [ventures, setVentures] = useState<Venture[]>(() => storage.getVentures());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

  // Synchronize data for active venture
  const refreshActiveVentureData = (vId: string) => {
    setCosts(storage.getCosts(vId));
    setProducts(storage.getProducts(vId));
    setBudgets(storage.getBudgets(vId));
    setProductionOrders(storage.getProductionOrders(vId));
    setVentures(storage.getVentures());
    setUsers(storage.getUsers());
  };

  useEffect(() => {
    // If user has specific venture assigned, enforce it
    let targetVentureId = activeVentureId;
    if (currentUser && currentUser.ventureId && currentUser.role !== 'root') {
      targetVentureId = currentUser.ventureId;
      setActiveVentureId(targetVentureId);
      storage.setActiveVentureId(targetVentureId);
    }
    refreshActiveVentureData(targetVentureId);
  }, [currentUser, activeVentureId]);

  const handleLogin = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    const targetVId = user.ventureId || storage.getActiveVentureId();
    setActiveVentureId(targetVId);
    storage.setActiveVentureId(targetVId);
    refreshActiveVentureData(targetVId);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleSelectVenture = (vId: string) => {
    setActiveVentureId(vId);
    storage.setActiveVentureId(vId);
    refreshActiveVentureData(vId);
  };

  const handleSaveCost = (cost: CostItem) => {
    storage.saveCost(cost);
    setCosts(storage.getCosts(activeVentureId));
  };

  const handleDeleteCost = (costId: string) => {
    storage.deleteCost(costId);
    setCosts(storage.getCosts(activeVentureId));
  };

  const handleSaveProduct = (product: Product) => {
    storage.saveProduct(product);
    setProducts(storage.getProducts(activeVentureId));
  };

  const handleDeleteProduct = (productId: string) => {
    storage.deleteProduct(productId);
    setProducts(storage.getProducts(activeVentureId));
  };

  const handleSaveBudget = (budget: Budget) => {
    storage.saveBudget(budget);
    setBudgets(storage.getBudgets(activeVentureId));
  };

  const handleDeleteBudget = (budgetId: string) => {
    storage.deleteBudget(budgetId);
    setBudgets(storage.getBudgets(activeVentureId));
  };

  const handleSaveProductionOrder = (order: ProductionOrder) => {
    storage.saveProductionOrder(order);
    setProductionOrders(storage.getProductionOrders(activeVentureId));
  };

  const handleDeleteProductionOrder = (orderId: string) => {
    storage.deleteProductionOrder(orderId);
    setProductionOrders(storage.getProductionOrders(activeVentureId));
  };

  const handleStartProductionOrder = (orderId: string, operatorName?: string) => {
    storage.startProductionOrder(orderId, operatorName);
    setProductionOrders(storage.getProductionOrders(activeVentureId));
  };

  const handlePauseProductionOrder = (orderId: string, reason: string) => {
    storage.pauseProductionOrder(orderId, reason);
    setProductionOrders(storage.getProductionOrders(activeVentureId));
  };

  const handleResumeProductionOrder = (orderId: string) => {
    storage.resumeProductionOrder(orderId);
    setProductionOrders(storage.getProductionOrders(activeVentureId));
  };

  const handleFinishProductionOrder = (orderId: string) => {
    storage.finishProductionOrder(orderId);
    setProductionOrders(storage.getProductionOrders(activeVentureId));
  };

  const handleSaveVenture = (
    venture: Venture,
    adminUser?: { name: string; username: string; password: string }
  ) => {
    storage.saveVenture(venture);
    if (adminUser) {
      const newAdmin: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: adminUser.name,
        username: adminUser.username,
        password: adminUser.password,
        role: 'admin',
        ventureId: venture.id,
        createdAt: new Date().toISOString(),
      };
      storage.saveUser(newAdmin);
    }
    setVentures(storage.getVentures());
    setUsers(storage.getUsers());
  };

  const handleDeleteVenture = (ventureId: string) => {
    storage.deleteVenture(ventureId);
    const updatedVentures = storage.getVentures();
    setVentures(updatedVentures);
    if (updatedVentures.length > 0) {
      handleSelectVenture(updatedVentures[0].id);
    }
  };

  const handleSaveUser = (user: User) => {
    storage.saveUser(user);
    setUsers(storage.getUsers());
  };

  const handleDeleteUser = (userId: string) => {
    storage.deleteUser(userId);
    setUsers(storage.getUsers());
  };

  const handleRefreshAllData = () => {
    const active = storage.getActiveVentureId();
    setActiveVentureId(active);
    setCurrentUser(storage.getCurrentUser());
    refreshActiveVentureData(active);
  };

  // If not authenticated, render Login/Auth view
  if (!currentUser) {
    return <AuthView users={users} ventures={ventures} onLogin={handleLogin} />;
  }

  const activeVenture =
    ventures.find((v) => v.id === activeVentureId) ||
    ventures[0] || {
      id: 'default',
      name: 'Medina Factory',
      industry: 'general' as const,
      description: '',
      currency: '$',
      monthlyCapacityUnits: 1000,
      createdAt: '',
    };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeVenture={activeVenture}
        ventures={ventures}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onSelectVenture={handleSelectVenture}
        onLogout={handleLogout}
        onOpenDatabaseTools={() => setIsDbModalOpen(true)}
        onOpenUserManual={() => setIsManualModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            activeVenture={activeVenture}
            ventures={ventures}
            costs={costs}
            products={products}
            budgets={budgets}
            orders={productionOrders}
            currentUser={currentUser}
            onSelectTab={setCurrentTab}
            onSelectVenture={handleSelectVenture}
          />
        )}

        {currentTab === 'costs' && (
          <CostsManager
            costs={costs}
            activeVenture={activeVenture}
            currentUser={currentUser}
            onSaveCost={handleSaveCost}
            onDeleteCost={handleDeleteCost}
          />
        )}

        {currentTab === 'products' && (
          <ProductsManager
            products={products}
            costs={costs}
            activeVenture={activeVenture}
            currentUser={currentUser}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'budgets' && (
          <BudgetsManager
            budgets={budgets}
            products={products}
            costs={costs}
            activeVenture={activeVenture}
            currentUser={currentUser}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {currentTab === 'production' && (
          <ProductionManager
            orders={productionOrders}
            activeVenture={activeVenture}
            products={products}
            costs={costs}
            budgets={budgets}
            currentUser={currentUser}
            onSaveOrder={handleSaveProductionOrder}
            onDeleteOrder={handleDeleteProductionOrder}
            onStartOrder={handleStartProductionOrder}
            onPauseOrder={handlePauseProductionOrder}
            onResumeOrder={handleResumeProductionOrder}
            onFinishOrder={handleFinishProductionOrder}
          />
        )}

        {currentTab === 'ventures' && currentUser.role === 'root' && (
          <VenturesManager
            ventures={ventures}
            users={users}
            costs={storage.getCosts(activeVenture.id)}
            products={storage.getProducts(activeVenture.id)}
            budgets={storage.getBudgets(activeVenture.id)}
            currentUser={currentUser}
            activeVentureId={activeVentureId}
            onSelectVenture={(id) => {
              handleSelectVenture(id);
              setCurrentTab('dashboard');
            }}
            onSaveVenture={handleSaveVenture}
            onDeleteVenture={handleDeleteVenture}
          />
        )}

        {currentTab === 'users' && (currentUser.role === 'root' || currentUser.role === 'admin') && (
          <UsersManager
            users={users}
            ventures={ventures}
            currentUser={currentUser}
            activeVentureId={activeVentureId}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>

      {/* Database Backup & Restore Modal */}
      <DatabaseToolsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onRefreshData={handleRefreshAllData}
      />

      {/* User Manual In-App Modal */}
      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">MEDINA FACTORY</span>
            <span>•</span>
            <span>Sistema Multi-Emprendimientos para Panadería, Empanadas, Cartelería y Calzado</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
            >
              Manual de Usuario
            </button>
            <span>•</span>
            <span className="text-[11px] text-slate-500 font-mono">
              Usuario: <strong className="text-cyan-400">{currentUser.username}</strong> ({currentUser.role})
            </span>
            <span>•</span>
            <span className="text-[11px] text-slate-500 font-mono">
              Empresa: <strong className="text-slate-300">{activeVenture.name}</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
