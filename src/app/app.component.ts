import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Vels University Trolls';
  now: number = 0;
  ngOnInit(): void {
    setInterval(() => {
      this.now = Date.now();
    }, 1);
  }
}
