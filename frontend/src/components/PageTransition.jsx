import { useState, useEffect, cloneElement, Children } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState('page-enter');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage('page-exit');
    } else {
      setDisplayLocation(location);
    }
  }, [location, displayLocation.pathname]);

  const handleAnimationEnd = () => {
    if (stage === 'page-exit') {
      setDisplayLocation(location);
      setStage('page-enter');
    }
  };

  const child = Children.only(children);
  const routeWithLocation = cloneElement(child, { location: displayLocation });

  return (
    <>
      {stage === 'page-exit' && (
        <div className="page-loader">
          <div className="page-loader-circle" />
        </div>
      )}
      <div className={stage} onAnimationEnd={handleAnimationEnd}>
        {routeWithLocation}
      </div>
    </>
  );
};

export default PageTransition;
