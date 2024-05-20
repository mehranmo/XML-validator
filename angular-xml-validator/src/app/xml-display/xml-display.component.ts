import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-xml-display',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './xml-display.component.html',
  styleUrls: ['./xml-display.component.scss']
})
export class XmlDisplayComponent implements OnChanges {
  @Input() xmlContent: string = '';

  formattedXml: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['xmlContent'] && this.xmlContent) {
      this.formattedXml = this.formatXmlToCollapsibleList(this.xmlContent);
    }
  }

  formatXmlToCollapsibleList(xml: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    return this.convertElementToCollapsibleList(xmlDoc.documentElement, 0);
  }

  convertElementToCollapsibleList(element: Element, depth: number): string {
    let html = `<div class="element depth-${depth}">`;

    const attributesHtml = Array.from(element.attributes).map(attr => {
      return `<div class="element-attribute">${attr.name}: <span class="element-text">${attr.value}</span></div>`;
    }).join('');

    if (element.children.length > 0) {
      html += `<details class="depth-${depth}">`;
      html += `<summary class="element-summary depth-${depth}">${element.tagName}</summary>`;
      html += attributesHtml;
      Array.from(element.children).forEach(child => {
        html += this.convertElementToCollapsibleList(child, depth + 1);
      });
      html += `</details>`;
    } else {
      const content = element.textContent?.trim() || '';
      if (content.length > 0 && content.length <= 50) {
        html += `<span class="element-summary depth-${depth}">${element.tagName}: <span class="element-text">${content}</span></span>`;
        html += attributesHtml;
      } else {
        html += `<details class="depth-${depth}">`;
        html += `<summary class="element-summary depth-${depth}">${element.tagName}</summary>`;
        html += attributesHtml;
        if (content.length > 0) {
          html += `<div class="element-text">${content}</div>`;
        }
        html += `</details>`;
      }
    }

    html += `</div>`;
    return html;
  }
}
