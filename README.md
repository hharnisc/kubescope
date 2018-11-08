# KubeScope 🔬

_NOTE:_ Now there is command line version of Kubescope with metrics updated every second: https://github.com/hharnisc/kubescope-cli

A microscope for Kubernetes deployments

![KubeScope](https://github.com/hharnisc/kubescope/raw/master/kube-scope.png)

## Quickstart

Deploy KubeScope

```sh
kubectl create -f deployment.yml
```

Get the pod name

```sh
kubectl get po | grep kube-scope
```

```
kubectl port-forward kube-scope-<container id from above> 3000:3000
```

Go to http://localhost:3000

## Limitations

- Currently only collects stats for pods on the node it is deployed on.
- Collects stats every 10-15 seconds
