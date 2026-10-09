import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { FindOrAskEntry } from './FindOrAskEntry';
vi.mock('@/i18n/I18nContext', () => ({ useI18n: () => ({ t: (key: string) => key, locale: 'en' }) }));
vi.mock('@/hooks/useInstantSearch', () => ({ useInstantSearch: () => ({ data: Array.from({length:6}, (_,i) => ({id:i,title:`Result ${i}`,subtitle:'Location',result_type:'moment',path:`/moments/${i}`})) }) }));
function Location() {return <output>{useLocation().pathname}</output>}
afterEach(() => {cleanup();vi.unstubAllGlobals();vi.restoreAllMocks()});
function mount() { render(<MemoryRouter><FindOrAskEntry source="home"/><button>Outside</button><Location/></MemoryRouter>); const input=screen.getByRole('combobox');fireEvent.focus(input);fireEvent.change(input,{target:{value:'Music'}});return input; }
test('portal escapes clipping and follows keyboard viewport resizing', () => {
 const viewport = new EventTarget();Object.assign(viewport,{height:320,offsetTop:50});vi.stubGlobal('visualViewport',viewport);
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockReturnValue({left:16,bottom:100,width:358} as DOMRect);
 mount();const list=screen.getByRole('listbox');expect(list.parentElement).toBe(document.body);expect(list.style.maxHeight).toBe('250px');
 act(()=>{Object.assign(viewport,{height:220});viewport.dispatchEvent(new Event('resize'))});expect(list.style.maxHeight).toBe('150px');
 expect(list).toHaveClass('overflow-y-auto','overscroll-contain');
});
test('touch scrolling blur does not discard results; selection navigates',()=>{
 const input=mount();fireEvent.pointerDown(screen.getByRole('option',{name:/Result 5/}),{pointerType:'touch'});fireEvent.blur(input,{relatedTarget:null});
 expect(screen.getAllByRole('option')).toHaveLength(6);fireEvent.scroll(screen.getByRole('listbox'));
 fireEvent.click(screen.getByRole('option',{name:/Result 5/}));expect(screen.getByText('/moments/5')).toBeInTheDocument();expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
test('escape, outside pointer and keyboard focus dismiss; input can reopen',()=>{
 const input=mount();fireEvent.keyDown(input,{key:'Escape'});expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
 fireEvent.focus(input);fireEvent.pointerDown(screen.getByText('Outside'));expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
 fireEvent.focus(input);fireEvent.focusIn(screen.getByText('Outside'));expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
 fireEvent.focus(input);fireEvent.keyDown(input,{key:'ArrowDown'});fireEvent.keyDown(input,{key:'Enter'});expect(screen.getByText('/moments/1')).toBeInTheDocument();
});

test('opens above the input when keyboard leaves too little room below',()=>{
 const viewport = new EventTarget();Object.assign(viewport,{height:470,offsetTop:0});vi.stubGlobal('visualViewport',viewport);
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockReturnValue({left:16,top:354,bottom:414,width:358} as DOMRect);
 mount();const list=screen.getByRole('listbox');expect(list.style.top).toBe('8px');expect(list.style.maxHeight).toBe('338px');
});
test('full-search action still submits its associated form from the portal',()=>{
 mount();fireEvent.click(screen.getByRole('button',{name:/search.button/}));expect(screen.getByText('/search')).toBeInTheDocument();expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
