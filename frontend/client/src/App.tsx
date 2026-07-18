import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import KnowledgeBase from "./pages/KnowledgeBase";
import Article from "./pages/Article";
import Calculator from "./pages/Calculator";
import Guide from "./pages/Guide";
import AdvancedCalculator from "./pages/AdvancedCalculator";
import AffordabilityCalculator from "./pages/AffordabilityCalculator";
import RentVsBuyCalculator from "./pages/RentVsBuyCalculator";
import BuydownCalculator from "./pages/BuydownCalculator";
import FrequentlyAskedQuestions from "./pages/FrequentlyAskedQuestions";
import MilitaryCalculator from "./pages/MilitaryCalculator";
import VAApprovedCondos from "./pages/VAApprovedCondos";
import VALoanSchofield from "./pages/VALoanSchofield";
import VALoanPearlHarbor from "./pages/VALoanPearlHarbor";
import VALoanKaneohe from "./pages/VALoanKaneohe";
import VALoanFortShafter from "./pages/VALoanFortShafter";
import VALoanTripler from "./pages/VALoanTripler";
import BAHBuyVsRent from "./pages/BAHBuyVsRent";
import LoanCompare from "./pages/LoanCompare";
import ShortLink from "./pages/ShortLink";
import DSCRCalculator from "./pages/DSCRCalculator";
import AssumableCalculator from "./pages/AssumableCalculator";
import EscalationCalculator from "./pages/EscalationCalculator";
import HelocSweepCalculator from "./pages/HelocSweepCalculator";
import Agents from "./pages/Agents";

function ScrollToTop() {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    // Strip trailing slash (except root) to prevent duplicate URLs
    if (location.length > 1 && location.endsWith("/")) {
      setLocation(location.replace(/\/+$/, ""), { replace: true });
      return;
    }
    window.scrollTo(0, 0);
  }, [location, setLocation]);
  return null;
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/about"} component={About} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/knowledge-base"} component={KnowledgeBase} />
        <Route path={"/knowledge-base/:slug"} component={Article} />
        <Route path={"/calculator"} component={Calculator} />
        <Route path={"/guide"} component={Guide} />
        <Route path={"/advanced-calculator"} component={AdvancedCalculator} />
        <Route path={"/affordability-calculator"} component={AffordabilityCalculator} />
        <Route path={"/rent-vs-buy"} component={RentVsBuyCalculator} />
        <Route path={"/buydown-calculator"} component={BuydownCalculator} />
        <Route path={"/military-calculator"} component={MilitaryCalculator} />
        <Route path={"/va-approved-condos-oahu"} component={VAApprovedCondos} />
        <Route path={"/va-loan-schofield-barracks"} component={VALoanSchofield} />
        <Route path={"/va-loan-pearl-harbor-hickam"} component={VALoanPearlHarbor} />
        <Route path={"/va-loan-kaneohe-mcbh"} component={VALoanKaneohe} />
        <Route path={"/va-loan-fort-shafter"} component={VALoanFortShafter} />
        <Route path={"/va-loan-tripler"} component={VALoanTripler} />
        <Route path={"/bah-buy-vs-rent-oahu"} component={BAHBuyVsRent} />
        <Route path={"/loan-compare"} component={LoanCompare} />
        <Route path={"/dscr-calculator"} component={DSCRCalculator} />
        <Route path={"/assumable-calculator"} component={AssumableCalculator} />
        <Route path={"/escalation-calculator"} component={EscalationCalculator} />
        <Route path={"/heloc-sweep-calculator"} component={HelocSweepCalculator} />
        <Route path={"/agents"} component={Agents} />
        <Route path={"/s/:id"} component={ShortLink} />
        {/* Redirect old agent routes to home */}
        <Route path={"/agent-hub"} component={() => { window.location.replace("/"); return null; }} />
        <Route path={"/agent-toolkit"} component={() => { window.location.replace("/"); return null; }} />
        <Route path={"/for-agents"} component={() => { window.location.replace("/"); return null; }} />
        <Route path={"/dealsync"} component={() => { window.location.replace("/"); return null; }} />
        <Route path={"/frequently-asked-questions"} component={FrequentlyAskedQuestions} />
        <Route path={"/faq"} component={() => { window.location.replace("/frequently-asked-questions"); return null; }} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
