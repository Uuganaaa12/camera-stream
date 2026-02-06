import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraDashboard } from './camera-dashboard';

describe('CameraDashboard', () => {
  let component: CameraDashboard;
  let fixture: ComponentFixture<CameraDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
