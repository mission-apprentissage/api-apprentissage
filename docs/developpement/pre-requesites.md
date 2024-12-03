# Pré-Requis

Afin de lancer le projet, il est nécessaire de s'assurer que tous les pré-requis soient complétés

## GPG

[Suivre la documentation dédié sur le repo infra](https://github.com/mission-apprentissage/infra/blob/main/docs/gpg.md)

## Docker

Installez [Docker version 23.03.0+](https://docs.docker.com/engine/install/)

## NodeJs

Installez [Node Js20+](https://nodejs.org/en/download)

> Vous pouvez utiliser [n](https://github.com/tj/n#third-party-installers) pour l'installer.

## Ansible

Installez [Ansible 2.07+](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

> Sur OS X vous pouvez utiliser `brew install ansible`

---

> Sur Ubuntu / WSL vous pouvez l'installer en 2 temps via :

> 1. L'ajout du dépôt Ansible officiel

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
```

> 2. L'installer avec la commande

```bash
sudo apt install -y ansible
```

## 1Password CLI

[Suivre la documentation dédié](./1password.md)

## Git LFS

[Installez git-lfs](https://git-lfs.com/)

## Yq

[Installez yq](https://github.com/mikefarah/yq)

> Sur OS X vous pouvez utiliser `brew install yq`

> Sur Ubuntu / WSL vous pouvez utiliser `sudo snap install yq`

## sshpass

[Installez sshpass](https://www.linuxtricks.fr/wiki/ssh-sshpass-la-connexion-ssh-par-mot-de-passe-non-interactive)

> Sur OS X vous pouvez utiliser

```bash
brew tap esolitos/ipa
brew install esolitos/ipa/sshpass
```

> Sur Ubuntu / WSL vous pouvez utiliser :

```bash
sudo apt install -y sshpass
```

## pwgen

> Sur OS X vous pouvez utiliser `brew install pwgen`

> Sur Ubuntu / WSL vous pouvez utiliser `sudo apt install -y pwgen`

## bash 5+

> Sur OS X vous pouvez utiliser `brew install bash`

> Sur Ubuntu / WSL vous pouvez utiliser `sudo apt install -y bash`
