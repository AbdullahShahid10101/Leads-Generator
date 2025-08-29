import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './Pages/SignupForm';
import Login from './Pages/LoginForm';
import Dashboard from './Pages/Dashboard';
import LeadFinder from './Pages/LeadFinder';
import AreaSelection from './Pages/AreaSelection';
import LiveScraping from './Pages/LiveScraping';
import CleaningVerify from './Pages/CleaningVerify';
import ResultsExport from './Pages/ResultsExport';
import IndustryPackages from './Pages/IndustryPackages';
import ScheduledUpdates from './Pages/ScheduledUpdates';
import Downloads from './Pages/Downloads';
import CrmIntegration from './Pages/CrmIntegration';
import ApiKeys from './Pages/ApiKeys';
import BillingPlans from './Pages/BillingPlans';
import CompetitorCompare from './Pages/CompetitorCompare';
import Compliance from './Pages/Compliance';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsOfService from './Pages/TermsOfService';
import HelpCenter from './Pages/HelpCenter';
import ProtectedRoute from './components/global/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={
            <ProtectedRoute>
              <Signup />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lead-finder" element={<LeadFinder />} />
          <Route path="/area-selection" element={<AreaSelection />} />
          <Route path="/live-scraping" element={<LiveScraping />} />
          <Route path="/cleaning-verify" element={<CleaningVerify />} />
          <Route path="/results-export" element={<ResultsExport />} />
          <Route path="/industry-packages" element={<IndustryPackages />} />
          <Route path="/scheduled-updates" element={<ScheduledUpdates />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/crm-integration" element={<CrmIntegration />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/billing-plans" element={<BillingPlans />} />
          <Route path="/competitor-compare" element={<CompetitorCompare />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/help" element={<HelpCenter />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
