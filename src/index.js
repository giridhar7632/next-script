#!/usr/bin/env node

const { argv } = require('yargs')
const fs = require('fs-extra')
const { join } = require('path')
const system = require('system-commands')
const chalk = require('chalk')

const static = Boolean(argv.static)
let [name, id] = argv._

const mkdir = path =>
  fs.mkdir(`${name}/${path}`)

const writeFile = (path, data) =>
  data
    ? fs.writeFile(`${name}/${path}`, `${data}\n`)
    : Promise.resolve()

const json = object =>
  JSON.stringify(object, null, '\t')

const makeRoot = async () => {
  console.log(chalk`{yellow.bold [WAITING]} {yellow Making root files...}`)

  await Promise.all([
    // package.json
    writeFile('package.json', json({
      name,
      scripts: {
        clean: `rm -rf public/out ${static ? 'public' : 'functions'}/.next`,
        start: 'npm run dev -C public'
      },
      private: true
    })),
    // .gitignore
    writeFile('.gitignore', [
      '**/*.DS_Store',
      '/node_modules',
      '*.log',
      '/.next/',
      '/build',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      '.vercel'
    ].join('\n')),
    //README.md
    writeFile('README.md',
      `# ${name}

> Scaffolded by [next-firebase](https://www.npmjs.com/package/next-script)

## Run dev server

\`\`\`bash
npm start
\`\`\`

## Deploy

\`\`\`bash
npm run deploy
\`\`\``)

  ])

  console.log(chalk`{green.bold [SUCCESS] Made root files}`)
}

const makePublic = async () => {
  console.log(chalk`{yellow.bold [WAITING]} {yellow Making public directory...}`)

  await mkdir('public')

  await Promise.all([
    mkdir('public/public'),
    mkdir('public/pages'),
    mkdir('public/styles')
  ])

  await Promise.all([
    // public/favicon.ico
    system(`cp ${join(__dirname, '../assets/favicon.ico', '../assets/vercel.svg')} ${name}/public/public`),

    // pages/_document.js
    writeFile(
      'public/pages/_document.js',
      `import Document, { Html, Head, Main, NextScript } from 'next/document'
export default class CustomDocument extends Document {
	render = () => (
		<Html lang="en">
			<Head />
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}`),
    // pages/_app.js
    writeFile(
      'public/pages/_app.js',
      `import { AppProps } from 'next/app'
import 'styles/global.scss'
const App = ({ Component, pageProps }: AppProps) => (
	<Component {...pageProps} />
)
export default App`),

    // pages/index.js
    writeFile(
      'public/pages/index.js',
      `import Head from 'next/head'
import styles from 'styles/Home.module.scss'
const Home = () => (
	<div className={styles.container}>
		<Head>
			<title>Next.js</title>
		</Head>
    <main className={styles.main}>
		<h1 className={styles.title}>Hello <span>World!</span> 👋</h1>
    </main>
	</div>
)
export default Home`),

    // styles/global.css
    writeFile(
      'public/styles/global.css',
      `html,
body {
	padding: 0;
	margin: 0;
	font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
		Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
	color: inherit;
	text-decoration: none;
}

* {
	box-sizing: border-box;
}`),

    // styles/Home.module.css
    writeFile(
      'public/styles/Home.module.css',
      `.container {
	min-height: 100vh;
	padding: 0 0.5rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.main {
	padding: 5rem 0;
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.title span {
	color: #0070f3;
}
.title {
	margin: 0;
	line-height: 1.15;
	font-size: 4rem;
	font-weight: 800;
	text-align: center;
}`),

    // next-env.d.ts
    writeFile(
      'public/next-env.d.ts',
      `/// <reference types="next" />
/// <reference types="next/types/global" />`),

    // .gitignore
    writeFile('public/.gitignore', [
      '**/*.DS_Store',
      '/node_modules',
      '*.log',
      '/.next/',
      '/build',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      '.vercel',
      'out/'
    ].join('\n')),

    // package.json
    writeFile('public/package.json', json({
      name: 'public',
      version: '1.0.0',
      scripts: {
        dev: 'next dev',
        build: `next build && next export${static ? '' : ' && mv .next ../functions'}`,
        start: 'next start'
      },
      dependencies: {},
      devDependencies: {},
      private: true
    })),
  ])

  console.log(chalk`{green.bold [SUCCESS] Made public directory}`)
  console.log(chalk`{yellow.bold [WAITING]} {yellow Installing dependencies for public (this might take some time)...}`)

  await system(`npm i next react react-dom sass -C ${name}/public`)
  await system(`npm i -D typescript @types/react @types/node -C ${name}/public`)

  console.log(chalk`{green.bold [SUCCESS] Installed dependencies for public}`)

  if (require.main === module)
    (async () => {
      try {
        if (!(typeof name === 'string' && typeof id === 'string'))
          return console.log(chalk`{red.bold npx next-firebase [project_name] [project_id]}`)

        name = name.replace(/\s+/g, '-').toLowerCase()

        console.log(chalk`\n{cyan.bold [START]} {cyan Creating your Next.js app in} {cyan.bold ${join(process.cwd(), name)}}\n`)

        await fs.mkdir(name)

        await Promise.all([
          makeRoot(),
          makePublic()
        ])

        console.log(chalk`\n{cyan.bold [END]} {cyan All done! cd into ${name} and run the dev server with "npm start".}\n`)
      } catch (error) {
        console.error(chalk`\n{red.bold [ERROR]} {red An error occurred:} {red.bold ${error.message}}\n`)
      }
    })()
}