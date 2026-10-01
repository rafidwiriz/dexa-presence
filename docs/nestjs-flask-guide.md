# NestJS ↔ Flask Concept Guide

Reference for contributors coming from Python Flask. Maps every NestJS concept to
its Flask equivalent so guides can be written in familiar terms.

## The big picture

| Flask | NestJS |
|---|---|
| `create_app()` app factory | `AppModule` (`@Module`) |
| Blueprint (`url_prefix`) | `@Controller('path')` |
| Route handler (`@app.route`) | `@Get()` / `@Post()` / `@Patch()` / `@Delete()` methods |
| View function body | Service method (`@Injectable()`) |
| `request.json` / `request.args` | `@Body()` / `@Query()` / `@Param()` |
| marshmallow / Pydantic schemas | DTO classes + `class-validator` + `ValidationPipe` |
| SQLAlchemy models | TypeORM entities |
| SQLAlchemy session / `query.all()` | `Repository` (`@InjectRepository`) |
| `@app.before_request` | Guards / middleware |
| `jsonify(...)` | return plain object/`Promise` (auto-serialized) |
| `app.run()` | `main.ts` `bootstrap()` |

## Project shape

```
src/
├── main.ts                  # entry point (create_app + app.run)
├── app.module.ts            # root module: imports, controllers, providers
└── <feature>/               # one folder per feature (blueprint)
    ├── x.controller.ts      # routes
    ├── x.service.ts         # business logic (view functions)
    ├── x.entity.ts          # SQLAlchemy model
    ├── x.dto.ts             # request schemas (marshmallow)
    └── x.module.ts          # glues controller + service + repo
```

## 1. Entry point — `main.ts`

```ts
const app = await NestFactory.create(AppModule);   // create_app()
app.setGlobalPrefix('api');                        // blueprint url_prefix
app.useGlobalPipes(new ValidationPipe(...));       // global schema validation
await app.listen(process.env.PORT ?? 3000);        // app.run()
```

## 2. Root module — `app.module.ts`

```ts
@Module({
  imports: [ConfigModule.forRoot(...), TypeOrmModule.forRootAsync(...), EmployeesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Flask analog: the function that creates the app, registers extensions (SQLAlchemy,
config) and blueprints (`imports`).

## 3. Controller — the Blueprint

```ts
@Controller('employees')          // url_prefix='/employees'
export class EmployeesController {
  @Get()        findAll()  {}     // GET    /employees
  @Get(':id')   findOne(@Param('id') id) {}   // GET /employees/<id>
  @Post()       create(@Body() dto) {}        // POST /employees
  @Patch(':id') update()  {}                  // PATCH /employees/<id>
  @Delete(':id')remove()  {}
}
```

- `@Param('id')` → Flask `request.view_args`
- `@Body()` → `request.json`
- `@Query()` → `request.args`
- Return a value/`Promise` → Nest JSON-serializes it (like `jsonify`).

## 4. Service — view-function logic

```ts
@Injectable()                    // a DI-provided singleton
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)  // inject the repo (like a SQLAlchemy model object)
    private readonly repo: Repository<Employee>,
  ) {}
  findAll()  { return this.repo.find(); }           // Model.query.all()
  create(d)  { return this.repo.save(this.repo.create(d)); }
  async findOne(id) { const e = await this.repo.findOneBy({ id }); if (!e) throw new NotFoundException(); return e; }
}
```

## 5. Module — glue

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Employee])],  // expose repo to this module
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
```

Register `EmployeesModule` in `AppModule.imports` to mount the blueprint.

## 6. Entity — SQLAlchemy model

```ts
@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 120 }) name: string;
  @Column({ length: 160, unique: true }) company_email: string;
  @Column({ type: 'enum', enum: EmployeeRole, default: EmployeeRole.EMPLOYEE }) role: EmployeeRole;
  @CreateDateColumn({ type: 'timestamptz' }) created_at: Date;
}
```

## 7. DTO + validation (marshmallow/Pydantic)

```ts
export class CreateEmployeeDto {
  @IsString() @MaxLength(120) name: string;
  @IsEmail() company_email: string;
  @IsString() @MinLength(8) password: string;
  @IsOptional() @IsString() phone?: string;
}
```

Activated globally by `ValidationPipe` in `main.ts`. Invalid payloads → 400
automatically (no manual checks).

## DI rules of thumb

- Controller **never** instantiates a service — the constructor param is injected
  because the service is a `provider` in the module.
- A service used by another module: export it in `providers`/`exports` and import
  that module.
- "When you see a constructor, something is being injected."

## Errors

- `NotFoundException` → 404
- `UnauthorizedException` → 401
- `ForbiddenException` → 403
- `BadRequestException` → 400
These replace `abort(404)` in Flask.