import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService } from '../services/test.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  data: any;

  constructor(private testService: TestService) {}

  ngOnInit() {
    console.log(this.testService);
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(this.testService)));

    this.testService.getTestData().subscribe((response: any) => {
      this.data = response;
      console.log(this.data);
    });
  }
}
