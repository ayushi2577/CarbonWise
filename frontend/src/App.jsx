import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';
import AIChat  from './components/AIChat';
import Home        from './pages/Home';
import GoGreen     from './pages/GoGreen';
import Compare     from './pages/Compare';
import Calculator  from './pages/Calculator';
import TheReality  from './pages/TheReality';
import Community   from './pages/Community';
import About       from './pages/About';
import ShowroomMirror from './pages/ShowroomMirror';
import './styles/globals.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <AIChat />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/go-green"        element={<GoGreen />} />
          <Route path="/compare"         element={<Compare />} />
          <Route path="/calculator"      element={<Calculator />} />
          <Route path="/the-reality"     element={<TheReality />} />
          <Route path="/community"       element={<Community />} />
          <Route path="/about"           element={<About />} />
          <Route path="/showroom-mirror" element={<ShowroomMirror />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}