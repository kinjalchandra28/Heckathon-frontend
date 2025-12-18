import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})
export class MarkdownHelperService {
    markdownToHtml(markdown: string): string {
        let html = markdown
            // Escape HTML special characters first
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

            // Headers (h1-h6)
            .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
            .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
            .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
            .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
            .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
            .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')

            // Bold and italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')

            // Unordered lists
            .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')

            // Ordered lists
            .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>')

            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')

            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

            // Horizontal rules
            .replace(/^---$/gm, '<hr>')

            // Line breaks - convert double newlines to paragraph breaks
            .replace(/\n\n+/g, '</p><p>')

            // Wrap consecutive <li> elements in <ul>
            .replace(/(<li>.*<\/li>)(\s*<li>)/g, '$1$2')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

        // Wrap in paragraph tags if not already wrapped
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<p>')) {
            html = '<p>' + html + '</p>';
        }

        // Clean up empty paragraphs
        html = html.replace(/<p>\s*<\/p>/g, '');

        // Fix paragraphs around block elements
        html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1');
        html = html.replace(/<p>\s*(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
        html = html.replace(/<p>\s*(<hr>)\s*<\/p>/g, '$1');

        return html;
    }
}   