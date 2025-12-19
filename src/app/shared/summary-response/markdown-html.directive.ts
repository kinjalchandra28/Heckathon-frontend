import { Directive, ElementRef, input, Renderer2, effect } from "@angular/core";
import { MarkdownHelperService } from "./markdown-help.service";

@Directive({
    selector: '[markdown]',
    standalone: true,
})
export class MarkdownDirective {
    constructor(private el: ElementRef, private markdownService: MarkdownHelperService,

    ) {
        effect(() => {
            this.el.nativeElement.innerHTML = this.markdownService.markdownToHtml(this.markdown());
        });

    }

    markdown = input<string>('');

}