# Documento de Requisitos — Reserva da Sala de Computadores

**Turma:** 2º B — Ensino Médio Técnico
**Projeto:** TCC / Projeto Integrador de Desenvolvimento de Software
**Responsável por este documento:** Analista de Requisitos

---

## 1. Problema
A sala de computadores da escola é usada por vários professores. Sem um controle organizado, acontecem conflitos de horário (dois professores querendo a sala ao mesmo tempo) e os professores precisam pedir a alguém para fazer a reserva.

## 2. Objetivo
Desenvolver um aplicativo em que o professor faça login e reserve a sala de computadores por conta própria, evitando conflitos de horário e organizando o uso da sala.

## 3. Público-alvo
- **Professores:** usam o sistema para reservar e cancelar horários.
- **Administrador:** gerencia os usuários e acompanha todas as reservas.

## 4. Requisitos funcionais (RF)
| Código | Requisito |
|---|---|
| RF01 | O sistema deve permitir login com e-mail institucional e senha. |
| RF02 | O sistema deve permitir que o professor reserve a sala informando data, horário de início, horário de fim, turma e observação. |
| RF03 | O sistema deve exibir as reservas de um dia para o professor escolher um horário livre. |
| RF04 | O sistema deve listar as reservas do próprio professor. |
| RF05 | O sistema deve permitir que o professor cancele as suas próprias reservas. |
| RF06 | O sistema deve permitir que o administrador cadastre professores. |
| RF07 | O sistema deve permitir que o administrador remova usuários. |
| RF08 | O sistema deve permitir que o administrador veja e cancele qualquer reserva. |
| RF09 | O sistema deve permitir sair da conta (logout). |
| RF10 | O sistema deve permitir escolher entre o Laboratório 1 e o Laboratório 2 ao reservar. |
| RF11 | O sistema deve mostrar o estoque de computadores de cada laboratório (carregados e descarregados). |
| RF12 | O sistema deve permitir que o professor atualize o estoque e deve registrar quem atualizou e quando. |

## 5. Requisitos não funcionais (RNF)
| Código | Requisito |
|---|---|
| RNF01 | As senhas devem ser armazenadas criptografadas, nunca em texto puro. |
| RNF02 | O sistema deve funcionar em computador e celular (responsivo). |
| RNF03 | O sistema deve ser fácil de usar, com telas simples e mensagens claras de erro. |
| RNF04 | A sessão do usuário deve expirar após 8 horas. |
| RNF05 | O sistema deve responder às ações do usuário em poucos segundos. |
| RNF06 | O sistema deve ser publicado em uma plataforma gratuita de hospedagem. |

## 6. Regras de negócio (RN)
| Código | Regra |
|---|---|
| RN01 | Não pode haver duas reservas ativas com horários sobrepostos na mesma sala e no mesmo dia. |
| RN02 | A hora de fim deve ser depois da hora de início. |
| RN03 | Não é possível reservar uma data que já passou. |
| RN04 | O professor só pode cancelar as suas próprias reservas. |
| RN05 | Somente o administrador pode cadastrar e remover usuários. |
| RN06 | Só entram no sistema usuários cadastrados pelo administrador. |
| RN07 | O primeiro usuário do sistema é o administrador. |
| RN08 | A reserva é feita por laboratório: o mesmo horário pode ser reservado em laboratórios diferentes. |
| RN09 | A soma de computadores carregados e descarregados não pode passar da capacidade do laboratório (30). |

## 7. Histórias de usuário
**Professor**
- **HU01:** Como professor, quero entrar no sistema com meu e-mail e senha para acessar minhas reservas com segurança.
- **HU02:** Como professor, quero ver os horários já reservados em um dia para escolher um horário livre.
- **HU03:** Como professor, quero reservar a sala de computadores para ter certeza de que ela estará livre na minha aula.
- **HU04:** Como professor, quero ser avisado quando o horário já estiver ocupado para escolher outro sem perder tempo.
- **HU05:** Como professor, quero ver minhas reservas para me organizar.
- **HU06:** Como professor, quero cancelar uma reserva minha para liberar a sala quando não for usá-la.

**Administrador**
- **HU07:** Como administrador, quero cadastrar professores para controlar quem acessa o sistema.
- **HU08:** Como administrador, quero remover usuários para impedir o acesso de quem saiu da escola.
- **HU09:** Como administrador, quero ver e cancelar qualquer reserva para resolver problemas de uso da sala.

- **HU10:** Como professor, quero escolher entre o Laboratório 1 e o Laboratório 2 para reservar o que estiver livre.
- **HU11:** Como professor, quero ver quantos computadores estão carregados e descarregados para saber se a turma poderá usá-los na aula.
- **HU12:** Como professor, quero informar o estoque de computadores ao final da aula para que o próximo professor saiba a situação.

## 8. Casos de uso (resumo)
| Caso de uso | Ator | Resultado |
|---|---|---|
| Fazer login | Professor / Admin | Acessa o sistema |
| Consultar reservas do dia | Professor / Admin | Vê os horários ocupados |
| Reservar sala | Professor | Reserva criada |
| Cancelar reserva | Professor / Admin | Reserva cancelada |
| Consultar e atualizar estoque | Professor / Admin | Estoque atualizado com nome de quem alterou |
| Cadastrar usuário | Admin | Novo professor criado |
| Remover usuário | Admin | Usuário excluído |

## 9. Fora do escopo (nesta versão)
Recuperação de senha por e-mail, várias salas com mapa visual e envio de notificações.
