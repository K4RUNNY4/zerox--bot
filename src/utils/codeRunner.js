const LANGUAGE_MAP = {
  python: 'cpython-3.14.0',
  py: 'cpython-3.14.0',
  javascript: 'nodejs-20.17.0',
  js: 'nodejs-20.17.0',
  node: 'nodejs-20.17.0',
  typescript: 'typescript-5.6.2',
  ts: 'typescript-5.6.2',
  cpp: 'gcc-13.2.0',
  'c++': 'gcc-13.2.0',
  c: 'gcc-13.2.0-c',
  rust: 'rust-1.82.0',
  rs: 'rust-1.82.0',
  go: 'go-1.23.2',
  golang: 'go-1.23.2',
  java: 'openjdk-jdk-22+36',
  ruby: 'ruby-4.0.2',
  rb: 'ruby-4.0.2',
  php: 'php-8.3.12',
  csharp: 'mono-6.12.0.199',
  cs: 'mono-6.12.0.199'
};

export function getSupportedLanguages() {
  return [
    'python', 'javascript', 'typescript', 'cpp', 'c',
    'rust', 'go', 'java', 'ruby', 'php', 'csharp'
  ];
}

export async function executeCode(language, code, stdin = '') {
  const compiler = LANGUAGE_MAP[language.toLowerCase()];
  if (!compiler) {
    throw new Error(`Unsupported language '${language}'. Supported: ${getSupportedLanguages().join(', ')}`);
  }

  const startTime = Date.now();
  const response = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot/1.0 (Mozilla/5.0)'
    },
    body: JSON.stringify({
      compiler,
      code,
      stdin
    })
  });

  if (!response.ok) {
    throw new Error(`Execution service returned status ${response.status}`);
  }

  const result = await response.json();
  const durationMs = Date.now() - startTime;

  const output = (result.program_output || result.program_message || '').trim();
  const error = (result.program_error || result.compiler_error || result.compiler_message || '').trim();

  return {
    success: result.status === '0' || result.status === 0,
    output: output || (error ? '' : 'No output produced.'),
    error: error || null,
    durationMs,
    compiler
  };
}
