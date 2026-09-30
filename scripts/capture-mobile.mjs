import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const ARTIFACT_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\096ca209-157f-47e0-a0b4-d592bac7a10d'

async function run() {
  console.log('Launching Edge headless...')
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  })

  const page = await browser.newPage()
  // Test at 360px width (standard Android phone / narrow split-screen window)
  await page.setViewport({
    width: 360,
    height: 780,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })

  console.log('Navigating to http://localhost:3000 ...')
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1200))
  
  const landingPath = path.join(ARTIFACT_DIR, 'mobile_landing_360.png')
  await page.screenshot({ path: landingPath, fullPage: false })
  console.log(`Saved landing screenshot to ${landingPath}`)

  console.log('Navigating to http://localhost:3000/doctor ...')
  await page.goto('http://localhost:3000/doctor', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1200))

  const doctorPath = path.join(ARTIFACT_DIR, 'mobile_doctor_360.png')
  await page.screenshot({ path: doctorPath, fullPage: false })
  console.log(`Saved doctor dashboard screenshot to ${doctorPath}`)

  await browser.close()
  console.log('All screenshots captured successfully!')
}

run().catch(err => {
  console.error('Error running capture script:', err)
  process.exit(1)
})
