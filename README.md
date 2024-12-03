# Glance2Web
Automatically extract (JSON format) content from the page without writing code.

The user provides a JSON Schema to describe what kind of content they want to get from the web page, and sets the matching URL rules. When the URL is accessed, the JSON data that conforms to the previously set JSON Schema can be extracted from the web page with one click.

## Get Started

```bash
# disabling chrome://flags/#text-safety-classifier flag (ref: https://issues.chromium.org/issues/379429927)

pnpm i

pnpm dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
