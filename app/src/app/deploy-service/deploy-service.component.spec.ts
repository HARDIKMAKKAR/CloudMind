import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployServiceComponent } from './deploy-service.component';

describe('DeployServiceComponent', () => {
  let component: DeployServiceComponent;
  let fixture: ComponentFixture<DeployServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeployServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeployServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
