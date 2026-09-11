"""Offline browser interaction smoke tests.

Run after npm run build. Requires Python Playwright and a Chromium executable.
Uses set_content because this preparation environment blocks browser navigation
including localhost/file URLs. Storage round-trip uses an explicit in-memory
Storage fixture, not a claim of native cross-device/browser persistence testing.
No remote CDN, AI API, or microphone is used.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'dist/tracecraft-preview.html').read_text()
OUT = Path(os.environ.get('TRACECRAFT_ARTIFACTS', str(ROOT / 'test-results')))
OUT.mkdir(parents=True, exist_ok=True)
checks = []
def check(label, condition=True):
    assert condition, label
    checks.append(label)
    print('PASS', label)
def inject_storage(page, seed=None):
    page.evaluate('''seed => {
      const values = new Map(Object.entries(seed || {}));
      Object.defineProperty(window, 'localStorage', {configurable:true, value:{
        getItem:key=>values.has(key)?values.get(key):null,
        setItem:(key,value)=>values.set(String(key),String(value)),
        removeItem:key=>values.delete(key), clear:()=>values.clear()
      }});
    }''', seed)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1050},device_scale_factor=1)
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    inject_storage(page)
    page.set_content(HTML)
    expect(page.get_by_role('heading',name='Your next chapter starts here, Builder.')).to_be_visible()
    check('Initial dashboard has real zero-progress state', '0 practice XP' in page.locator('.top-stat').inner_text())
    page.screenshot(path=str(OUT/'desktop.png'),full_page=True)
    page.get_by_role('button',name='Continue learning',exact=True).click()
    expect(page.locator('#challenge-select')).to_have_value('ticket-cost')
    check('First daily lesson starts with variables; timer starts', page.locator('#session-timer').count()==1)
    page.locator('#challenge-select').select_option('running-total')
    page.get_by_role('button',name='Run & trace',exact=True).click()
    expect(page.locator('#trace-region')).to_contain_text('STEP 1 OF 11')
    page.get_by_role('button',name='Next step',exact=True).click()
    expect(page.locator('#trace-region')).to_contain_text('total now holds 0')
    check('Code run produces source-linked state and working step controls')
    page.locator('#scrubber').fill('10')
    expect(page.locator('.output-panel pre')).to_have_text('10')
    check('Scrubber shows actual final output')
    page.get_by_role('button',name='Check tests',exact=True).click()
    expect(page.locator('#test-region')).to_contain_text('4/4 passed')
    expect(page.locator('.top-stat')).to_contain_text('50 practice XP')
    check('Public fixture checks award one-time practice credit')
    page.get_by_role('button',name='Check tests',exact=True).click()
    expect(page.locator('.top-stat')).to_contain_text('50 practice XP')
    check('Repeated test clicks do not farm XP')
    page.get_by_role('button',name='Repair a bug',exact=True).click()
    page.get_by_role('button',name='Check tests',exact=True).click()
    check('Deliberate bug produces failing fixture feedback',page.locator('.test-row.fail').count()>0)
    page.get_by_role('button',name='Reset example',exact=True).click()
    page.locator('#code-editor').fill('x = 7\nprint(x * 3)')
    page.get_by_role('button',name='Run & trace',exact=True).click()
    page.locator('#scrubber').fill('1')
    expect(page.locator('.output-panel pre')).to_have_text('21')
    check('Editing source changes execution; no canned trace')
    page.get_by_role('button',name='Line blocks',exact=True).click()
    page.get_by_role('button',name='Move line 2 up',exact=True).click()
    page.get_by_role('button',name='Code',exact=True).click()
    expect(page.locator('#code-editor')).to_have_value('print(x * 3)\nx = 7')
    page.get_by_role('button',name='Run & trace',exact=True).click()
    check('Line blocks change source and invalid ordering produces an error',page.locator('#trace-region [role="alert"]').count()==1)
    page.get_by_role('button',name='Reset example',exact=True).click()
    page.get_by_role('button',name='Read lesson',exact=True).click()
    expect(page.locator('#modal')).to_be_visible()
    expect(page.locator('#modal')).to_contain_text('Why it works')
    page.keyboard.press('Escape')
    check('Original lesson dialog opens and Escape closes it',not page.locator('#modal').is_visible())
    page.get_by_role('button',name='Run & trace',exact=True).click()
    page.locator('#scrubber').fill('7')
    page.screenshot(path=str(OUT/'lab.png'),full_page=True)
    page.keyboard.press('Control+k')
    page.locator('#global-search').fill('Java')
    expect(page.locator('#search-results')).to_contain_text('Speak Java fluently')
    page.locator('#search-results a').filter(has_text='Speak Java').click()
    expect(page.locator('#modal')).to_contain_text('This stage is planned')
    page.keyboard.press('Escape')
    check('Keyboard concept search distinguishes planned content')
    page.get_by_role('link',name='Learning path',exact=True).click()
    check('All curriculum stages render',page.locator('.stage').count()==13)
    page.get_by_role('link',name='Systems lab',exact=True).click()
    page.locator('#rag-query').fill('database index')
    page.get_by_role('button',name='Retrieve evidence',exact=False).click()
    expect(page.locator('.evidence').first).to_contain_text('L02')
    check('Retrieval searches the actual original corpus')
    page.locator('#rag-query').fill('quantum flamingos')
    page.get_by_role('button',name='Retrieve evidence',exact=False).click()
    expect(page.locator('#evidence-results')).to_contain_text('No supporting passage found')
    check('Unsupported retrieval abstains instead of inventing evidence')
    page.get_by_role('button',name='Cache & capacity',exact=True).click()
    page.locator('#cache-hit').fill('0')
    expect(page.locator('#cache-metrics')).to_contain_text('150%')
    expect(page.locator('#cache-metrics')).to_contain_text('overloaded')
    check('Capacity controls recompute a labeled toy model')
    page.get_by_role('button',name='Database filtering',exact=True).click()
    page.locator('#db-min').fill('100')
    page.locator('#db-min').dispatch_event('change')
    expect(page.locator('#system-content')).to_contain_text('Matching rows (1)')
    check('Relational filtering changes visible output rows')
    page.get_by_role('link',name='Reading room',exact=True).click()
    expect(page.locator('.book-card a[target="_blank"]')).to_have_count(12)
    check('Reading catalog contains twelve external source links')
    page.get_by_role('link',name='Interview studio',exact=True).click()
    page.locator('#transcript').fill('After k iterations, the accumulator equals the sum of the first k values.')
    page.get_by_role('button',name='Save explanation locally',exact=True).click()
    page.locator('.rubric-check').first.check()
    expect(page.locator('#rubric-status')).to_contain_text('1 of 4')
    check('Typed interview explanation and self-assessment work without AI')
    page.get_by_role('link',name='Settings',exact=True).click()
    page.locator('#display-name').fill('<img src=x onerror=alert(1)>')
    page.locator('#reduce-motion').check()
    page.get_by_role('button',name='Save preferences',exact=True).click()
    check('Display name is escaped, not rendered as executable markup',page.locator('.profile img').count()==0)
    check('Reduced-motion preference applies',page.locator('body.reduce-motion').count()==1)
    saved=page.evaluate("localStorage.getItem('tracecraft:v1')")
    second=context.new_page()
    inject_storage(second,{'tracecraft:v1':saved})
    second.set_content(HTML)
    second.get_by_role('link',name='Interview studio',exact=True).click()
    expect(second.locator('#transcript')).to_contain_text('After k iterations')
    check('Serialized state round-trips through a simulated Storage fixture')
    second.close()
    # Export is an actual browser download event; do not retain the user's notes in artifacts.
    with page.expect_download() as event:
        page.get_by_role('button',name='Export progress JSON',exact=True).click()
    check('Progress export produces a JSON download',event.value.suggested_filename.endswith('.json'))
    page.get_by_role('button',name='Reset local progress',exact=True).click()
    page.get_by_role('button',name='Reset local data',exact=True).click()
    expect(page.locator('.top-stat')).to_contain_text('0 practice XP')
    check('Explicit reset clears practice and notes')
    # Check every route at narrow widths; a horizontal navigation scroller is intentional.
    for width in [390,760]:
        page.set_viewport_size({'width':width,'height':844})
        for name in ['Today','Learning path','Practice lab','Systems lab','Reading room','Interview studio','Settings']:
            page.locator('.nav a').filter(has_text=name).click()
            expect(page.locator('.nav a[aria-current="page"]')).to_contain_text(name)
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'),f'Overflow at {width}: {name}'
    check('Seven routes have no document-width overflow at 390 and 760 pixels')
    page.set_viewport_size({'width':390,'height':844})
    page.get_by_role('link',name='Today',exact=True).click()
    page.screenshot(path=str(OUT/'mobile.png'),full_page=True)
    check('No uncaught browser application errors',not errors)
    browser.close()
(OUT/'browser-results.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'errors':errors,'mode':'Offline HTML; Storage round-trip uses a test double; live networking/audio untested'},indent=2))
print(f'{len(checks)} browser smoke checks passed.')
