# llm-token-formats-benchmark

Benchmarking JSON and alternative structured data formats (TOON, tiny, TONL, minified JSON) for LLM token efficiency, using real datasets and reproducible scripts.

## Why Token-Efficient Formats Matter

When working with LLMs, every token counts:

- **Cost**: API pricing is per-token. Reducing tokens directly reduces spend.
- **Context window**: Models have fixed limits (4K, 8K, 128K tokens). Structured data can consume significant portions of this budget.
- **Latency**: Fewer tokens means faster processing and response times.

Standard JSON is verbose—curly braces, quotes, colons, and whitespace add up quickly. This benchmark explores whether alternative formats can reduce token overhead while preserving data structure.

## Formats Compared

| Format | Description | Tooling |
|--------|-------------|---------|
| **JSON** | Standard pretty-printed JSON | Native |
| **Minified JSON** | JSON with whitespace removed | Native |
| **TOON** | Tabular Object Oriented Notation - CSV-like with header metadata | [toon-lang](https://www.npmjs.com/package/toon-lang) CLI, [GitHub](https://github.com/toon-format/toon) |
| **TONL** | Similar to TOON with slightly different syntax | [tonl](https://www.npmjs.com/package/tonl), [GitHub](https://github.com/tonl-dev/tonl) |
| **tiny** | Minimal format: `name(fields\|row1\|row2...` with no closing paren | [GitHub](https://github.com/asynkron/tiny), custom script included |

## Results

**Dataset**: 64KB JSON file (197 records) from [Microsoft Edge DevTools demo](https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json)

**Tokenizer**: `gpt-4o-mini` via [@dqbd/tiktoken](https://www.npmjs.com/package/@dqbd/tiktoken)

```
$ node count-tokens.js
Model tokenizer: gpt-4o-mini

┌─────────────────────┬──────────┬─────────────────────────────┬──────────┬─────────────────────────────┐
│ File                │ Size(KB) │     Size Reduction          │ Tokens   │     Token Reduction         │
├─────────────────────┼──────────┼─────────────────────────────┼──────────┼─────────────────────────────┤
│ data.json           │    68.26 │ ░░░░░░░░░░░░░░░░░░░░   0.0% │    19339 │ ░░░░░░░░░░░░░░░░░░░░   0.0% │
│ data-minify.json    │    55.37 │ ████░░░░░░░░░░░░░░░░  18.9% │    15596 │ ████░░░░░░░░░░░░░░░░  19.4% │
│ data.toon           │    46.69 │ ██████░░░░░░░░░░░░░░  31.6% │    13687 │ ██████░░░░░░░░░░░░░░  29.2% │
│ data.tiny           │    45.98 │ ███████░░░░░░░░░░░░░  32.6% │    13218 │ ██████░░░░░░░░░░░░░░  31.7% │
│ data.tonl           │    46.71 │ ██████░░░░░░░░░░░░░░  31.6% │    13883 │ ██████░░░░░░░░░░░░░░  28.2% │
└─────────────────────┴──────────┴─────────────────────────────┴──────────┴─────────────────────────────┘
```

| File | Size (KB) | Size Reduction | Tokens | Token Reduction |
|------|-----------|----------------|--------|-----------------|
| data.json | 68.26 | — | 19,339 | — |
| data-minify.json | 55.37 | 18.9% | 15,596 | 19.4% |
| data.toon | 46.69 | 31.6% | 13,687 | 29.2% |
| data.tiny | 45.98 | 32.6% | 13,218 | **31.7%** |
| data.tonl | 46.71 | 31.6% | 13,883 | 28.2% |

**Key findings**:
- Minifying JSON alone saves ~19% tokens with zero format changes
- TOON/TONL achieve ~28-29% reduction with established tooling
- tiny achieves the best compression (31.7%) but requires custom parsing

## Reproducing the Benchmark

### Prerequisites

- Node.js 18+
- npm

### Steps

```bash
# Clone the repository
git clone https://github.com/devwithmj/llm-token-formats-benchmark.git
cd llm-token-formats-benchmark

# Install dependencies
npm install

# Run the benchmark
node count-tokens.js
```

### Regenerating Format Files

```bash
# Regenerate tiny format from JSON
node tiny.js data.json data.tiny

# For TOON: use the toon-lang CLI
npx toon-lang encode data.json > data.toon

# For TONL: use the tonl package API
```

## Format Details

### TOON
```
[197]{name,language,id,bio,version}:
  Adeel Solangi,Sindhi,V59OF92YF627HFY0,Donec lobortis...,6.1
  Afzal Ghaffar,Sindhi,ENTOCR13RSCLZ6KU,"Aliquam...",1.88
```

### tiny
```
records(name language id bio version|Adeel Solangi Sindhi V59OF92YF627HFY0 Donec lobortis... 6.1|Afzal Ghaffar Sindhi ENTOCR13RSCLZ6KU Aliquam... 1.88
```
Note: tiny intentionally omits the closing parenthesis to save one token.

### TONL
```
#version 1.0
root[197]{bio,id,language,name,version}:
  Donec lobortis...,V59OF92YF627HFY0,Sindhi,Adeel Solangi,6.1
```

## Usability vs Compression Trade-offs

| Format | Compression | Ease of Use | Notes |
|--------|-------------|-------------|-------|
| Minified JSON | Low | High | No tooling needed, universal parser support |
| TOON | Medium | High | Published npm package, clear specification |
| TONL | Medium | Medium | npm package available, similar to TOON |
| tiny | High | Low | No official encoder/decoder, requires custom scripts |

## Notes

- **LoreTokens**: I attempted to include this format but the website was unavailable at the time of testing.
- **Model-specific**: Results are tokenizer-dependent. Different models (GPT-4, Claude, etc.) may show different token counts.
- **Data-dependent**: Compression varies based on data structure. Highly repetitive field names benefit more from these formats.

## Repository Contents

```
├── data.json           # Original pretty-printed JSON
├── data-minify.json    # Minified JSON
├── data.toon           # TOON format
├── data.tonl           # TONL format
├── data.tiny           # tiny format
├── 64KB.json           # Source dataset from Microsoft
├── count-tokens.js     # Benchmark script
├── tiny.js             # JSON → tiny converter
└── package.json        # Dependencies
```

## License

MIT
