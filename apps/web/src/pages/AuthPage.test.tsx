import React from 'react';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {MemoryRouter, useNavigate} from 'react-router-dom';
vi.mock('@/contexts/AuthContext',()=>({useAuth:()=>({user:null,loading:false,signIn:vi.fn(),signUp:vi.fn(),demoSignIn:vi.fn(),signInWithGoogle:vi.fn()})}));
vi.mock('@/hooks/use-toast',()=>({useToast:()=>({toast:vi.fn()})}));
const language = vi.hoisted(() => ({locale: 'en'}));
vi.mock('@/i18n/I18nContext',()=>({useI18n:()=>({t:(key:string)=>translations[language.locale][key] || key})}));
import { translations, supportedLocales } from '@/i18n/translations';
vi.mock('@/lib/marketing-attribution',()=>({captureGrowthAttribution:vi.fn(),markPendingSignup:vi.fn(),trackGrowthEvent:vi.fn()}));
vi.mock('@/components/MetaPixel',()=>({trackMetaEvent:vi.fn()}));
import AuthPage from './AuthPage';
import {ChunkErrorBoundary} from '@/components/ChunkErrorBoundary';
afterEach(()=>{cleanup();sessionStorage.clear();localStorage.clear();vi.restoreAllMocks()});
function NavigationProbe() { const navigate=useNavigate();return <><button onClick={()=>navigate('/auth?mode=signup&role=agency')}>Go agency</button><button onClick={()=>navigate('/auth')}>Go generic</button><button onClick={()=>navigate(-1)}>Back</button></> }
const mount=(url:string)=>render(<MemoryRouter initialEntries={[url]}><NavigationProbe/><ChunkErrorBoundary><AuthPage/></ChunkErrorBoundary></MemoryRouter>);

for (const locale of supportedLocales) {
 for (const role of ['participant','creator','host','brand','merchant','agency']) {
  test(`${locale}: signup ${role} renders every role without crashing`,()=>{
   language.locale=locale;
   mount(`/auth?mode=signup&role=${role}&next=%2Fbusiness%2Fstart%3Fresume%3D1`);
   if (screen.queryByRole('button',{name:translations[locale]['auth.business']})) fireEvent.click(screen.getByRole('button',{name:translations[locale]['auth.business']}));
   for (const supported of ['participant','creator','host','brand','merchant','agency']) {
    const button=screen.getByRole('button',{name:new RegExp(translations[locale][`auth.${supported}`])});
    fireEvent.click(button);
   }
   expect(screen.queryByText('This view hit an error')).not.toBeInTheDocument();
  });
 }
}
test('generic login stays neutral through signup role selection and return',()=>{
 language.locale='en';mount('/auth');
 expect(screen.queryByText(translations.en['auth.previewWorkspace'])).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:translations.en['auth.signUp']}));
 fireEvent.click(screen.getByRole('button',{name:translations.en['auth.business']}));
 fireEvent.click(screen.getByRole('button',{name:/Brand/}));
 fireEvent.click(screen.getByRole('button',{name:translations.en['auth.signIn']}));
 expect(screen.getByText(translations.en['auth.loginCopy'])).toBeInTheDocument();
 expect(screen.queryByText(translations.en['auth.previewWorkspace'])).not.toBeInTheDocument();
});
test('explicit merchant login retains business workspace preview',()=>{
 language.locale='en';mount('/auth?mode=login&role=merchant');
 expect(screen.getByText(translations.en['auth.previewWorkspace'])).toBeInTheDocument();
});

test('same mounted auth resets commercial mode on generic navigation and restores on Back',()=>{
 language.locale='en';mount('/auth');
 fireEvent.click(screen.getByText('Go agency'));expect(screen.getByText(translations.en['auth.previewWorkspace'])).toBeInTheDocument();
 fireEvent.click(screen.getByText('Go generic'));expect(screen.getByText(translations.en['auth.welcomeBack'])).toBeInTheDocument();expect(screen.queryByText(translations.en['auth.previewWorkspace'])).not.toBeInTheDocument();
 fireEvent.click(screen.getByText('Back'));expect(screen.getByText(translations.en['auth.previewWorkspace'])).toBeInTheDocument();
});
