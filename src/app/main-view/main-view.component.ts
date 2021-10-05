import {Component, OnInit} from '@angular/core';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  foods: any[];
  showView = false;
  error: any;
  showDelete = false;
  showAdd = false;
  showEdit = false;
  deleteFoodId: number;

  foodId: number;
  name: string;
  company: string;
  price: number;
  amount: number;

  constructor(private apollo: Apollo, private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.getFoods();
  }

  getFoods(): void {
    this.apollo
    .query<any>({
      query: gql`
        {
          foods {
            id
            name
            company
            isGood
            price
            isTasty,
            amount
          }
        }
      `
    })
    .subscribe(
      ({data}) => {
        this.foods = data.foods;
      },
      error => {
        console.log('i am not ');
        this.error = error;
      }
    );
  }

  addNewFood(): void {
    this.apollo
    .mutate({
      mutation: gql`
        mutation SaveFood($name: String!, $company: String!, $price: Int!, $amount: Int!) {
          saveFood(food: { name: $name, company: $company, price: $price, amount: $amount }) {
            id,
            name,
            company,
            isGood,
            price,
            isTasty,
            amount,
          }
        }
      `,
      variables: {
        name: this.name,
        company: this.company,
        price: this.price,
        amount: this.amount
      }
    })
    .subscribe(
      ({data}) => {
        this.foods.push(data.saveFood);
        this.toastrService.success('Jedzenie dodane prawidłowo!');
        this.showAdd = false;
        this.clearVariables();
        this.getFoods();
      },
      error => {
        this.toastrService.error('Błąd podczas dodawnia jedzenia');
      }
    );
  }

  editFood(): void {
    const id = this.foods[this.foodId - 1]?.id;
    this.apollo
    .mutate({
      mutation: gql`
        mutation UpdateFood($id: Int!, $name: String!, $company: String!, $price: Int!, $amount: Int!) {
          updateFood(food: { temporaryId: $id, name: $name, company: $company, price: $price, amount: $amount }) {
            id, name, isGood, company, amount
          }
        }
      `,
      variables: {
        id,
        name: this.name,
        company: this.company,
        price: this.price,
        amount: this.amount
      }
    })
    .subscribe(
      ({}) => {
        this.toastrService.success('Jedzenie zaaktualizowane prawidłowo!');
        this.showEdit = false;
        this.clearVariables();
        this.getFoods();
      },
      error => {
        this.toastrService.error('Błąd podczas aktualizacji jedzenia');
      }
    );
  }



  deleteFoodById(): void {
    const foodId: number = this.foods[this.deleteFoodId - 1]?.id;
    if (!foodId) {
      this.toastrService.error('Podaj prawidłowy index !');
    } else {
      this.apollo
      .mutate({
        mutation: gql`
          mutation DeletePost($id: Int!) {
            deleteFood(id: $id)
          }
        `,
        variables: {
          id: foodId
        }
      })
      .subscribe(
        ({}) => {
          this.toastrService.success('Jedzenie usunięte prawidłowo!');
          this.showDelete = false;
          this.foods.splice(this.foods.findIndex((food) => food.id === foodId), 1);
          this.getFoods();
        },
        error => {
          this.toastrService.error('Błąd podczas usuwania jedzenia');
        }
      );
    }
  }

  clearVariables(): void {
    this.name = '';
    this.company = '';
    this.amount = null;
    this.price = null;
  }

}
