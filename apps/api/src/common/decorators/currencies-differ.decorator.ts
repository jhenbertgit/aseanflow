import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function CurrenciesDiffer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'currenciesDiffer',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as { from?: string; to?: string };
          return obj.from !== obj.to;
        },
        defaultMessage() {
          return 'Source and target currencies must differ';
        },
      },
    });
  };
}
