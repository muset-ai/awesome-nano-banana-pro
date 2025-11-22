<a id="cases-{{{case_no}}}"></a>
### {{{t.case_caption}}} {{{case_no}}}{{{t.colon}}}{{{title}}} (by [{{{author}}}]({{{author_link}}}))

> **Type:** `{{{capability_type}}}`

{{{source_links}}}

<img src="cases/{{{case_no}}}/{{{image}}}" width="300" alt="{{{alt_text}}}"><br>
<sub>Image © 2025 <a href="{{{attribution.image_author_link}}}">{{{attribution.image_author}}}</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> • Prompt by <a href="{{{attribution.prompt_author_link}}}">{{{attribution.prompt_author}}}</a></sub>

{{#has_reference_images}}
**{{{t.reference_images_caption}}}**

{{#reference_images}}
<img src="cases/{{{case_no}}}/{{{.}}}" width="150" alt="Reference image">
{{/reference_images}}

{{/has_reference_images}}

**{{{t.prompt_caption}}}**

```
{{{prompt}}}
```

{{#submitter}}
**{{{t.submitter_caption}}}** [{{{submitter}}}]({{{submitter_link}}})
{{/submitter}}

---

[⬆️ {{{t.return_to_cases_toc_caption}}}](#cases-toc)
