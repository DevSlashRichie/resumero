package user

type Repository interface {
	Create(user *User) error
}
