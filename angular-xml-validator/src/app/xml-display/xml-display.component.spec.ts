import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlDisplayComponent } from './xml-display.component';

describe('XmlDisplayComponent', () => {
  let component: XmlDisplayComponent;
  let fixture: ComponentFixture<XmlDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(XmlDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
