<a id="cases-{{{case_no}}}"></a>
### {{{t.case_caption}}} {{{case_no}}}{{{t.colon}}}{{{title}}}

{{#has_badges}}
<p>
{{#badges}}
<img src="{{{url}}}" alt="{{{name}}}">
{{/badges}}
</p>

{{/has_badges}}
<img src="cases/{{{case_no}}}/{{{image}}}" width="300" alt="{{{alt_text}}}"><br>
<sub>Image © 2025 <a href="{{{attribution.image_author_link}}}">{{{attribution.image_author}}}</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> • Prompt by <a href="{{{attribution.prompt_author_link}}}">{{{attribution.prompt_author}}}</a> • {{{source_links}}}</sub>

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

[⬆️ {{{t.return_to_cases_toc_caption}}}](#cases-toc)

---

