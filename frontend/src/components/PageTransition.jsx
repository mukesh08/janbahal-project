import { useState, useEffect, cloneElement, Children } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState('page-enter');

  useEffect(() => {
    if (location.key !== displayLocation.key) {
      setStage('page-exit');
    }
  }, [location]);

  const handleAnimationEnd = () => {
    if (stage === 'page-exit') {
      setDisplayLocation(location);
      setStage('page-enter');
    }
  };

  // Pass displayLocation to <Routes> so the old page stays visible during fade-out
  const child = Children.only(children);
  const routeWithLocation = cloneElement(child, { location: displayLocation });

  return (
    <div className={stage} onAnimationEnd={handleAnimationEnd}>
      {routeWithLocation}
    </div>
  );
};

export default PageTransition;
