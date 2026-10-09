import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PastAftrHrs from './PastAftrHrs';
vi.mock('@/components/SEO',()=>({default:()=>null}));
test('retains an event record without a claim or RSVP action',()=>{
 render(<MemoryRouter><PastAftrHrs/></MemoryRouter>);
 expect(screen.getByText('Past event')).toBeInTheDocument();
 expect(screen.getByText(/New RSVPs and pass claims are closed/)).toBeInTheDocument();
 expect(screen.getAllByRole('link')).toHaveLength(1);
 expect(screen.getByRole('link')).toHaveAttribute('href','/live');
});
