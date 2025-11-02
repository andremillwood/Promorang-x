import { forwardRef } from 'react';

interface TestSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const TestSurface = forwardRef<HTMLDivElement, TestSurfaceProps>(({ children, ...props }, ref) => (
  <div 
    ref={ref} 
    style={{ 
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}
    {...props}
  >
    {children || 'Test Surface Component'}
  </div>
));

export default TestSurface;
