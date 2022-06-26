export const WATCH_GLOBS = {
  js: './src/**/*.js',
  styles: './src/**/*.scss',
  emails: './src/emails/**/*.html',
  form: './src/**/*.html',
  headers: './src/**/{header.html,report.html}'
}

export const ROOT_FILENAMES = {
  common: ['app', 'main', 'index'],
  ['.js']: ['script'],
  ['.scss']: ['style'],
  ['.html']: ['form']
}

export const ROOT_PROJECT_PATHS = {
  ['.js']: 'js',
  ['.scss']: 'styles',
  ['.html']: 'form'
}


export const CONFIG_FILENAME = 'zeev-config.js'
