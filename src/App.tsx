import { Dashboard } from './components/dashboard/Dashboard';
import { AddWidgetDrawer } from './components/drawer/AddWidgetDrawer';
import { PageHeader } from './components/layout/PageHeader';
import { Topbar } from './components/layout/Topbar';
import { Toast } from './components/ui/Toast';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to dashboard</a>
      <Topbar />
      <main id="main" className="page">
        <PageHeader />
        <Dashboard />
      </main>
      <AddWidgetDrawer />
      <Toast />
    </>
  );
}
