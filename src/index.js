#!/usr/bin/env node

const { argv } = require('yargs')
const fs = require('fs-extra')
const { join } = require('path')
const system = require('system-commands')
const chalk = require('chalk')

const static = Boolean(argv.static)
let name = argv._

const mkdir = path =>
  fs.mkdir(`${name}/${path}`)

const writeFile = (path, data) =>
  data
    ? fs.writeFile(`${name}/${path}`, `${data}\n`)
    : Promise.resolve()

const json = object =>
  JSON.stringify(object, null, '\t')

const makeRoot = async () => {
  console.log(chalk`{yellow.bold [WAITING]} {yellow Making required directories...}`)

  await Promise.all([
    // package.json
    writeFile('public/package.json', json({
      name,
      version: '1.0.0',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start'
      },
      dependencies: {},
      devDependencies: {},
      private: true
    })),
    // README.md
    writeFile(
      'README.md',
      `# ${name}

      ## Getting started 🚀
      \`\`\`
      npx next-script my-app
      \`\`\`

      ## Run dev server 👨‍💻
      \`\`\`bash
      npm run dev
      \`\`\`

      ## Build 🤹‍♂️
      \`\`\`bash
      npm run build
      \`\`\`
      
      ## Learn More 📃
      To learn more about Next.js, take a look at the following resources:

      - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
      - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

      You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
      `),
      // gitignore
      writeFile('.gitignore', [
			'# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.', ' ',
      '# dependencies', 
      '/node_modules',
      '/.pnp',
      '.pnp.js', ' ',
      '# testing',
      '/coverage', ' ',
      '# next.js',
      '/.next/',
      '/out/', ' ',
      '# production',
      '/build', ' ',
      '# misc',
      '.DS_Store',
      '*.pem',
      '*.log', ' ',
      '# local env files',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local', ' ',
      '# vercel',
      '.vercel'
		].join('\n')),
    // .env
    writrFile('.env', [
      'NEXT_PUBLIC_FIREBASE_API_KEY=',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID='
    ].join('\n')),
    // .env.local
    writeFile('.env.local', "#Add your secrets here as given in `.env` file")
  ])

  console.log(chalk`{green.bold [SUCCESS] Made root files}`)
}
const makeFolders = async () => {
  await Promise.all([
    mkdir('public'),
    mkdir('pages'),
    mkdir('pages/api'),
    mkdir('styles'),
    mkdir('.vscode')
  ])

  await Promise.all([
		// public
		system(`cp ${join(__dirname, '../assets/favicon.ico')} ${name}/public`),
    system(`cp ${join(__dirname, '../assets/vercel.svg')} ${name}/public`),

    // pages
    // _app.js
    writeFile('pages/_app.js', `
    import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
	return <Component {...pageProps} />
}

export default MyApp
    `),
    // index.js
    writeFile('pages/index.js', `
    import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
	return (
		<div className={styles.container}>
			<Head>
				<title>Next App</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>
					Hello <span>World!</span> 👋
				</h1>
				<div className={styles.description}>
					<p>This is a starter Next.js template. ✨</p>
					<a href="https://github.com/giridhar7632/next-app">
						<button className={styles.btn}>GitHub</button>
					</a>
				</div>
			</main>
		</div>
	)
}
    `),
    // api
    writeFile('pages/api/hello.js', `
    // Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
	res.status(200).json({ name: 'John Doe' })
}
    `),
    // styles
    // globals.css
    writeFile('styles/globals.css', `
    html,
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
}

    `),
    // home.module.css
    writeFile('styles/Home.module.css', `
    .container {
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
}
.description {
	font-size: 1.5rem;
	font-weight: 600;
	text-align: left;
	width: 100%;
}
.btn {
	font-size: 1.2rem;
	font-weight: 700;
	font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
		Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
	background: #0070f3;
	color: #ffffff;
	padding: 0.5rem;
	border: none;
	border-radius: 5px;
	letter-spacing: 0.5pt;
}
.btn:hover {
	box-shadow: 0 0 0.5rem #0070f3;
	cursor: pointer;
}
.btn:focus {
	outline: none;
}
.btn:active {
	background: #0051ad;
}
    `),
    // settings.json
    writeFile('.vscode/settings.json', json({
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      },
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.formatOnSave": true,
      "editor.lineNumbers": "on",
      "discord.enabled": true
    }))
  ]),

  console.log(chalk`{green.bold [SUCCESS] Made required directories}`)
	console.log(chalk`{yellow.bold [WAITING]} {yellow Installing dependencies (this might take some time)...}`)
	
	await system(`npm i next react react-dom -C ${name}`)
	
	console.log(chalk`{green.bold [SUCCESS] Installed dependencies for public}`)
}

if (require.main === module)
	(async () => {
		try {
			if (!(typeof name === 'string'))
				return console.log(chalk`{red.bold npx next-script [project_name]}`)
			
			name = name.replace(/\s+/g, '-').toLowerCase()
			
			console.log(chalk`\n{cyan.bold [START]} {cyan Creating your Next.js app in} {cyan.bold ${join(process.cwd(), name)}}\n`)
			
			await fs.mkdir(name)
			
			await Promise.all([
				makeRoot(),
				makeFolders()
			])
			
			console.log(chalk`\n{cyan.bold [END]} {cyan All done! cd into ${name} and run the dev server with "npm run dev".}\n`)
		} catch (error) {
			console.error(chalk`\n{red.bold [ERROR]} {red An error occurred:} {red.bold ${error.message}}\n`)
		}
	})()