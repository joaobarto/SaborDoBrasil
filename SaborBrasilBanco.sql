SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `SabordoBrasil` DEFAULT CHARACTER SET utf8;
USE `SabordoBrasil`;

-- -----------------------------------------------------
-- Table `usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `senha` VARCHAR(45) NOT NULL,
  `nickname` VARCHAR(45) NOT NULL,
  `createdat` TIMESTAMP NULL,
  `updatedat` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `publicacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `publicacao` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome_prato` VARCHAR(80) NOT NULL,
  `local` VARCHAR(45) NOT NULL,
  `cidade` VARCHAR(45) NOT NULL,
  `foto` TEXT NULL,
  `createdat` TIMESTAMP NULL,
  `updatedat` TIMESTAMP NULL,
  `usuario_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `usuario_id_idx` (`usuario_id` ASC) VISIBLE,
  CONSTRAINT `fk_publicacao_usuario_id`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `comentario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comentario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NULL,
  `publicacao_id` INT NOT NULL,
  `texto` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `usuarioid_idx` (`usuario_id` ASC) VISIBLE,
  INDEX `publicacaoid_idx` (`publicacao_id` ASC) VISIBLE,
  CONSTRAINT `fk_comentario_usuario_id`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_comentario_publicacao_id`
    FOREIGN KEY (`publicacao_id`)
    REFERENCES `publicacao` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `interacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `interacao` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `curtidas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curtidas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `publicacao_id` INT NOT NULL,
  `interacao_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `usuario_id_idx` (`usuario_id` ASC) VISIBLE,
  INDEX `publicacao_id_idx` (`publicacao_id` ASC) VISIBLE,
  INDEX `interacao_id_idx` (`interacao_id` ASC) VISIBLE,
  CONSTRAINT `fk_curtidas_usuario_id`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_curtidas_publicacao_id`
    FOREIGN KEY (`publicacao_id`)
    REFERENCES `publicacao` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_curtidas_interacao_id`
    FOREIGN KEY (`interacao_id`)
    REFERENCES `interacao` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Dados iniciais para tabela `usuario`
-- ------------------------------------------------------
INSERT INTO `usuario` (`id`, `nome`, `nickname`, `email`, `senha`, `createdat`, `updatedat`) VALUES
(1, 'Filipe Augusto', 'abner12', 'abner12@gmail.com', 'senha123', NOW(), NOW()),
(2, 'Dilma Roussef', 'Dilminha', 'petrobras@gmail.com', 'lulalivre', NOW(), NOW()),
(3, 'Messias Bolsonaro', 'Mito123', 'luladrao@gmail.com', 'e22naveia', NOW(), NOW()),
(4, 'Gabriel Barbosa', 'GabrielB', 'barbosa2002@gmail.com', 'barbosa256', NOW(), NOW());

-- ------------------------------------------------------
-- Dados iniciais para tabela `publicacao`
-- ------------------------------------------------------
INSERT INTO `publicacao` (`id`, `foto`, `nome_prato`, `local`, `cidade`, `usuario_id`, `createdat`, `updatedat`) VALUES
(1, 'img/publicacao01.png', 'Filé de tilápia', 'Axé moa', 'Porto Seguro-BA', 1, NOW(), NOW()),
(2, 'img/publicacao02.png', 'Carne com foia', 'Praia de Copacabana', 'Rio de Janeiro-RJ', 2, NOW(), NOW());

-- ------------------------------------------------------
-- Dados iniciais para tabela `interacao`
-- ------------------------------------------------------
INSERT INTO `interacao` (`nome`) VALUES ('like'), ('dislike');

-- ------------------------------------------------------
-- Exemplo corrigido de inserção na tabela `curtidas`
-- Certifique-se que a publicação_id exista!
-- ------------------------------------------------------
-- Exemplo válido: usuário 1 curtindo publicação 1 com interacao 'like' (id=1)
INSERT INTO `curtidas` (usuario_id, publicacao_id, interacao_id) VALUES (1, 1, 1);

-- Caso queira atualizar para 'dislike'
UPDATE `curtidas`
SET interacao_id = 2
WHERE usuario_id = 1 AND publicacao_id = 1;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
