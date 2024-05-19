import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-xml-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xml-display.component.html',
  styleUrls: ['./xml-display.component.scss']
})
export class XmlDisplayComponent implements OnChanges {
  @Input() xmlContent: string = '';

  formattedXml: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['xmlContent'] && this.xmlContent) {
      this.formattedXml = this.formatXmlToMarkdown(this.xmlContent);
    }
  }

  formatXmlToMarkdown(xml: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    return this.convertElementToMarkdown(xmlDoc.documentElement, 1);
  }

  convertElementToMarkdown(element: Element, level: number): string {
    let markdown = '';
    const tagName = element.tagName.split(':').pop(); // Remove namespace
    const indent = '  '.repeat(level - 1);
    const heading = '#'.repeat(level);

    if (element.children.length > 0) {
      markdown += `${indent}${heading} ${tagName}\n`;
      Array.from(element.children).forEach(child => {
        markdown += this.convertElementToMarkdown(child, level + 1);
      });
    } else {
      markdown += `${indent}${heading} ${tagName}: ${element.textContent}\n`;
    }

    Array.from(element.attributes).forEach(attr => {
      markdown += `${indent}- ${attr.name}: ${attr.value}\n`;
    });

    return markdown;
  }
}
